import { useState, FormEvent, useRef, ChangeEvent, MouseEvent, Dispatch, SetStateAction, useEffect } from 'react';
import { Video, Link as LinkIcon, Plus, LogOut, CheckCircle2, Search, Trash2, Edit2, X, Save, Image as ImageIcon, Upload, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VideoItem } from '../types';

import TrainingGrid from './TrainingGrid';
import FeedbackSection from './FeedbackSection';

interface AdminDashboardProps {
  isDarkMode: boolean;
  onLogout: () => void;
  videos: VideoItem[];
  setVideos: Dispatch<SetStateAction<VideoItem[]>>;
}

import { getVideoThumbnail } from '../lib/videoUtils';

export default function AdminDashboard({ isDarkMode, onLogout, videos, setVideos }: AdminDashboardProps) {
  const [videoName, setVideoName] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [videoImage, setVideoImage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const progress = scrollTop / (scrollHeight - clientHeight);
      setScrollProgress(isNaN(progress) ? 0 : progress);
    }
  };

  useEffect(() => {
    const updateThumbHeight = () => {
      if (scrollContainerRef.current) {
        const { scrollHeight, clientHeight } = scrollContainerRef.current;
        if (scrollHeight > clientHeight) {
          const h = (clientHeight / scrollHeight) * 100;
          setThumbHeight(Math.max(h, 10)); // Min 10%
        } else {
          setThumbHeight(0);
        }
      }
    };

    updateThumbHeight();
    window.addEventListener('resize', updateThumbHeight);
    return () => window.removeEventListener('resize', updateThumbHeight);
  }, [videos]);

  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Use stable references for event listeners to avoid cleanup issues during re-renders
  const handleMouseMoveRef = useRef<(e: globalThis.MouseEvent) => void>(null);
  const handleMouseUpRef = useRef<() => void>(null);

  const handleThumbMouseDown = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDragging.current = true;
    startY.current = e.clientY;
    if (scrollContainerRef.current) {
      startScrollTop.current = scrollContainerRef.current.scrollTop;
    }
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
    
    window.addEventListener('mousemove', handleMouseMoveRef.current as any);
    window.addEventListener('mouseup', handleMouseUpRef.current as any);
  };

  useEffect(() => {
    handleMouseMoveRef.current = (e: globalThis.MouseEvent) => {
      if (!isDragging.current || !scrollContainerRef.current || !trackRef.current) return;
      
      const deltaY = e.clientY - startY.current;
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      const scrollableHeight = scrollHeight - clientHeight;
      const trackHeight = trackRef.current.clientHeight;
      
      const thumbPixels = (thumbHeight / 100) * trackHeight;
      const effectiveTrackHeight = trackHeight - thumbPixels;
      
      if (effectiveTrackHeight <= 0) return;

      const ratio = scrollableHeight / effectiveTrackHeight;
      scrollContainerRef.current.scrollTop = startScrollTop.current + deltaY * ratio;
    };

    handleMouseUpRef.current = () => {
      isDragging.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMoveRef.current as any);
      window.removeEventListener('mouseup', handleMouseUpRef.current as any);
    };

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveRef.current as any);
      window.removeEventListener('mouseup', handleMouseUpRef.current as any);
    };
  }, [thumbHeight]); // Re-bind if thumbHeight changes to ensure correct ratio

  const handleTrackClick = (e: MouseEvent) => {
    if (isDragging.current || !scrollContainerRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const trackHeight = rect.height;
    
    const { scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollableHeight = scrollHeight - clientHeight;
    
    const thumbPixels = (thumbHeight / 100) * trackHeight;
    const effectiveTrackHeight = trackHeight - thumbPixels;
    
    let progress = (clickY - thumbPixels / 2) / effectiveTrackHeight;
    progress = Math.max(0, Math.min(1, progress));
    
    scrollContainerRef.current.scrollTo({
      top: progress * scrollableHeight,
      behavior: 'smooth'
    });
  };

  const scrollByAmount = (direction: 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const amount = 300;
      scrollContainerRef.current.scrollBy({
        top: direction === 'up' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newVideo: VideoItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: videoName.toUpperCase(),
      link: videoLink,
      createdAt: Date.now(),
      image: videoImage.trim() !== '' ? videoImage : getVideoThumbnail(videoLink)
    };
    setVideos([newVideo, ...videos]);
    setShowSuccess(true);
    setVideoName('');
    setVideoLink('');
    setVideoImage('');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDelete = (e: MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Deseja realmente excluir este treinamento?')) {
      setVideos((prev: VideoItem[]) => {
        const updated = prev.filter(v => v.id !== id);
        return updated;
      });
    }
  };

  const startEditing = (video: VideoItem) => {
    setEditingId(video.id);
    setEditName(video.name);
  };

  const saveEdit = () => {
    setVideos(prev => prev.map(v => v.id === editingId ? { ...v, name: editName.toUpperCase() } : v));
    setEditingId(null);
  };

  const filteredVideos = videos.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`pt-24 pb-20 px-10 max-w-5xl mx-auto transition-colors duration-300`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-zinc-800 pb-8 gap-4">
        <div>
          <h2 className="text-[10px] font-black tracking-[0.4em] text-brand-yellow uppercase mb-2">Painel de Controle</h2>
          <h1 className="text-4xl font-[900] tracking-tighter uppercase">Gerenciar Treinamentos</h1>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase opacity-50 hover:opacity-100 hover:text-red-500 transition-all"
        >
          <LogOut size={14} />
          Sair do Painel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form Column */}
        <div className="lg:col-span-5">
          <div className={`p-8 border transition-all duration-300 sticky top-24 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xl'}`}>
            <div className="flex items-center gap-3 mb-8">
              <Plus className="text-brand-yellow" size={24} />
              <h3 className="text-xl font-black tracking-tight uppercase">Adicionar Novo Vídeo</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500">Título do Vídeo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-brand-yellow transition-colors">
                    <Video size={18} />
                  </div>
                  <input 
                    type="text" 
                    value={videoName}
                    onChange={(e) => setVideoName(e.target.value)}
                    placeholder="EX: COMO CONFIGURAR O FUNIL"
                    className={`w-full py-4 pl-12 pr-4 text-xs font-bold tracking-widest uppercase border outline-none focus:border-brand-yellow transition-all ${isDarkMode ? 'bg-zinc-800/50 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500">Link do Vídeo (Youtube/Vimeo)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-brand-yellow transition-colors">
                    <LinkIcon size={18} />
                  </div>
                  <input 
                    type="url" 
                    value={videoLink}
                    onChange={(e) => setVideoLink(e.target.value)}
                    placeholder="HTTPS://WWW.YOUTUBE.COM/WATCH?V=..."
                    className={`w-full py-4 pl-12 pr-4 text-xs font-bold tracking-widest border outline-none focus:border-brand-yellow transition-all ${isDarkMode ? 'bg-zinc-800/50 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-widest uppercase text-zinc-500">Link da Capa (Opcional)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-brand-yellow transition-colors">
                    <ImageIcon size={18} />
                  </div>
                  <input 
                    type="url" 
                    value={videoImage}
                    onChange={(e) => setVideoImage(e.target.value)}
                    placeholder="HTTPS://IMAGES.UNSPLASH.COM/..."
                    className={`w-full py-4 pl-12 pr-12 text-xs font-bold tracking-widest border outline-none focus:border-brand-yellow transition-all ${isDarkMode ? 'bg-zinc-800/50 border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'}`}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-y-0 right-4 flex items-center text-zinc-600 hover:text-brand-yellow transition-colors"
                    title="Upload de imagem local"
                  >
                    <Upload size={18} />
                  </button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                {videoImage && (
                  <div className="mt-2 relative group w-20 h-12 border border-zinc-800 overflow-hidden">
                    <img src={videoImage} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setVideoImage('')}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-3 py-5 bg-brand-yellow text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-900 hover:text-brand-yellow dark:hover:bg-white dark:hover:text-black transition-colors group mt-4"
              >
                <span>Publicar Treinamento</span>
                <Plus size={16} />
              </button>
            </form>

            <AnimatePresence>
              {showSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 p-4 bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-3 rounded-lg"
                >
                  <CheckCircle2 size={18} />
                  <span className="text-[10px] font-black tracking-widest uppercase">Vídeo adicionado com sucesso!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-brand-yellow transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="BUSCAR TREINAMENTO..."
              className={`w-full py-4 pl-12 pr-4 text-[10px] font-black tracking-widest uppercase border outline-none focus:border-brand-yellow transition-all ${isDarkMode ? 'bg-black border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}
            />
          </div>

          <div className="flex gap-6">
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar-hidden scroll-smooth"
            >
              {filteredVideos.map((video) => (
                <div 
                  key={video.id}
                  className={`p-6 border transition-all duration-300 flex items-center justify-between group ${isDarkMode ? 'bg-zinc-900/50 border-zinc-800' : 'bg-white border-zinc-100 hover:shadow-lg'}`}
                >
                  <div className="flex-grow">
                    {editingId === video.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={`bg-zinc-800 text-white border border-brand-yellow py-2 px-3 text-xs font-bold tracking-widest uppercase outline-none w-full`}
                          autoFocus
                        />
                        <button onClick={saveEdit} className="p-2 text-green-500 hover:bg-green-500/10 transition-colors"><Save size={18} /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 text-red-500 hover:bg-red-500/10 transition-colors"><X size={18} /></button>
                      </div>
                    ) : (
                      <>
                        <h4 className="text-sm font-black tracking-tighter uppercase mb-1">{video.name}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase">Link: {video.link.substring(0, 30)}...</span>
                          <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                          <span className="text-[9px] font-bold tracking-widest text-zinc-600 uppercase">
                            {new Date(video.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {editingId !== video.id && (
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEditing(video)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(e, video.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {filteredVideos.length === 0 && (
                <div className="py-20 text-center border border-dashed border-zinc-800 opacity-30">
                  <Search size={40} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black tracking-widest uppercase">Nenhum treinamento encontrado</p>
                </div>
              )}
            </div>

            {/* Custom Side Scroll UI */}
            {thumbHeight > 0 && (
              <div className="w-4 flex flex-col items-center justify-between py-2 flex-shrink-0">
                <button 
                  onClick={() => scrollByAmount('up')}
                  className="text-brand-yellow border border-brand-yellow/30 w-6 h-6 flex items-center justify-center hover:bg-brand-yellow/10 transition-colors rounded-sm"
                >
                  <ChevronUp size={14} />
                </button>

                <div 
                  ref={trackRef}
                  onClick={handleTrackClick}
                  className="flex-1 w-[2px] bg-zinc-800/50 my-6 relative rounded-full cursor-pointer"
                >
                  <motion.div 
                    onMouseDown={(e: MouseEvent) => handleThumbMouseDown(e)}
                    className="absolute left-1/2 -translate-x-1/2 w-2 bg-brand-yellow shadow-[0_0_15px_rgba(250,204,21,0.5)] rounded-full cursor-grab active:cursor-grabbing hover:w-3 transition-[width]"
                    style={{ 
                        height: `${thumbHeight}%`, 
                        top: `${scrollProgress * (100 - thumbHeight)}%` 
                    }}
                  />
                </div>

                <button 
                  onClick={() => scrollByAmount('down')}
                  className="text-brand-yellow border border-brand-yellow/30 w-6 h-6 flex items-center justify-center hover:bg-brand-yellow/10 transition-colors rounded-sm"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-24 pt-24 border-t border-zinc-800">
        <FeedbackSection isAdmin={true} />
      </div>

      <style>{`
        .custom-scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

