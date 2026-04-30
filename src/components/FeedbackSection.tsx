import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Edit2, Check, X, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Feedback } from '../types';

interface FeedbackSectionProps {
  isAdmin?: boolean;
}

export default function FeedbackSection({ isAdmin = false }: FeedbackSectionProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    const saved = localStorage.getItem('app_feedbacks');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);

  useEffect(() => {
    localStorage.setItem('app_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem('app_feedbacks');
      if (saved) {
        setFeedbacks(JSON.parse(saved));
      }
    };

    window.addEventListener('app-feedback-updated', handleUpdate);
    return () => window.removeEventListener('app-feedback-updated', handleUpdate);
  }, []);

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
  }, [feedbacks]);

  const isDragging = useRef(false);
  const startY = useRef(0);
  const startScrollTop = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Use stable references for event listeners to avoid cleanup issues during re-renders
  const handleMouseMoveRef = useRef<(e: MouseEvent) => void>(null);
  const handleMouseUpRef = useRef<() => void>(null);

  const handleThumbMouseDown = (e: React.MouseEvent) => {
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
    handleMouseMoveRef.current = (e: MouseEvent) => {
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

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging.current || !scrollContainerRef.current) return;
    
    // Get click position relative to track
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const trackHeight = rect.height;
    
    // Calculate new scroll progress
    // clickY corresponds to the top of the thumb ideally? Or center?
    // Let's go with center of thumb
    const { scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollableHeight = scrollHeight - clientHeight;
    
    // progress = (clickY / trackHeight) normalized
    // But thumb has height, so real range is 0 to trackHeight - thumbPixels
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

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Deseja excluir este feedback?')) {
      setFeedbacks(prev => {
        const updated = prev.filter(f => f.id !== id);
        localStorage.setItem('app_feedbacks', JSON.stringify(updated));
        window.dispatchEvent(new Event('app-feedback-updated'));
        return updated;
      });
    }
  };

  const handleClearAll = () => {
    if (!isAdmin) return;
    if (window.confirm('Deseja apagar todas as perguntas?')) {
      setFeedbacks([]);
      localStorage.setItem('app_feedbacks', JSON.stringify([]));
      window.dispatchEvent(new Event('app-feedback-updated'));
    }
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const handleSaveEdit = (id: string) => {
    setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, text: editText.toUpperCase() } : f));
    setEditingId(null);
  };

  const canModify = (createdAt: number) => {
    const thirtyMinutes = 30 * 60 * 1000;
    return (Date.now() - createdAt) < thirtyMinutes;
  };

  return (
    <section id="feedback-section" className="container mx-auto px-10 py-16 max-w-4xl">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-[10px] font-bold tracking-[0.4em] text-brand-yellow uppercase">FAQ & Feedback</h2>
        {isAdmin && feedbacks.length > 0 && (
          <button 
            onClick={handleClearAll}
            className="text-[9px] font-black tracking-widest uppercase text-zinc-500 hover:text-red-500 transition-colors flex items-center gap-2"
          >
            <Trash2 size={12} />
            LIMPAR TUDO
          </button>
        )}
      </div>

      <div className="flex gap-8">
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar-hidden scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {feedbacks.map((item) => {
              const userAbleToEdit = canModify(item.createdAt);
              const isEditing = editingId === item.id;

              return (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 border border-zinc-800 bg-zinc-900/50 group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-[9px] font-black tracking-widest uppercase text-zinc-500">
                      {item.user} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    
                    {(isAdmin || userAbleToEdit) && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isEditing ? (
                          <>
                            {(isAdmin || userAbleToEdit) && (
                              <button onClick={() => startEditing(item.id, item.text)} className="p-1 hover:text-brand-yellow text-zinc-600 transition-colors">
                                <Edit2 size={12} />
                              </button>
                            )}
                            {isAdmin && (
                              <button onClick={() => handleDelete(item.id)} className="p-1 hover:text-red-500 text-zinc-600 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleSaveEdit(item.id)} className="p-1 text-green-500">
                              <Check size={14} />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-red-500">
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <input 
                      autoFocus
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(item.id)}
                      className="w-full bg-zinc-800 border-none p-0 text-xl font-bold tracking-tight text-brand-yellow uppercase outline-none"
                    />
                  ) : (
                    <p className="text-xl font-bold tracking-tight text-white uppercase group-hover:text-brand-yellow transition-colors">
                      {item.text}
                    </p>
                  )}

                  {userAbleToEdit && !isEditing && (
                    <div className="absolute bottom-0 left-0 h-[1px] bg-brand-yellow/30 w-full">
                      <motion.div 
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ 
                          duration: (30 * 60 * 1000 - (Date.now() - item.createdAt)) / 1000, 
                          ease: "linear" 
                        }}
                        className="h-full bg-brand-yellow"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {feedbacks.length === 0 && (
            <div className="text-center py-20 border border-dashed border-zinc-800 opacity-20">
              <p className="text-[10px] font-black tracking-[0.5em] uppercase">Nenhum feedback ainda</p>
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
                onMouseDown={handleThumbMouseDown}
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

      <style>{`
        .custom-scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
        .custom-scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
