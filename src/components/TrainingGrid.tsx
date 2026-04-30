import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, ChevronUp, ChevronDown } from 'lucide-react';
import { VideoItem } from '../types';
import { getEmbedUrl } from '../lib/videoUtils';

interface TrainingGridProps {
  videos: VideoItem[];
}

export default function TrainingGrid({ videos }: TrainingGridProps) {
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);

  const embedUrl = selectedVideo ? getEmbedUrl(selectedVideo.link) : null;

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

  const scrollByAmount = (direction: 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const amount = 300;
      scrollContainerRef.current.scrollBy({
        top: direction === 'up' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="container mx-auto px-10 py-8 min-h-[400px]">
      {videos.length > 0 ? (
        <div className="flex gap-8 h-[700px]">
          {/* Main Content Area */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto pr-6 custom-scrollbar-hidden scroll-smooth"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 shadow-2xl">
              {videos.map((training, index) => (
                <motion.div 
                  key={training.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative h-[300px] cursor-pointer overflow-hidden border transition-colors duration-300 border-zinc-800 dark:border-zinc-800 border-zinc-100"
                  onClick={() => setSelectedVideo(training)}
                >
                  <img 
                    src={training.image || "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop"} 
                    alt={training.name}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover filter transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:brightness-100 grayscale brightness-50 group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 transition-colors duration-500 bg-black/60 group-hover:bg-black/20" />
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-brand-yellow flex items-center justify-center text-black shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                      <Play size={32} fill="currentColor" />
                    </div>
                  </div>

                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <span className="text-[10px] font-bold tracking-[0.3em] text-brand-yellow uppercase mb-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                      ASSISTIR AGORA
                    </span>
                    <h3 className="text-2xl font-[1000] tracking-tighter uppercase leading-none max-w-[200px] text-white">
                      {training.name}
                    </h3>
                  </div>

                  <div className="absolute top-4 right-4 text-[10px] font-bold transition-opacity group-hover:opacity-100 opacity-30 text-white">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </motion.div>
              ))}
            </div>
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

              <div className="flex-1 w-[2px] bg-zinc-800/50 my-6 relative rounded-full">
                <motion.div 
                  className="absolute left-1/2 -translate-x-1/2 w-2 bg-brand-yellow shadow-[0_0_15px_rgba(250,204,21,0.5)] rounded-full"
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
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 opacity-30">
          <p className="text-[10px] font-black tracking-[0.5em] uppercase">Nenhum treinamento encontrado</p>
        </div>
      )}

      {/* Video Modal Player */}
      <AnimatePresence>
        {selectedVideo && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideo(null)}
              className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200]"
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="fixed inset-4 md:inset-20 z-[201] flex flex-col items-center justify-center pointer-events-none"
            >
                <div className="w-full max-w-5xl aspect-video bg-black shadow-2xl relative border border-zinc-800 pointer-events-auto">
                    <button 
                        onClick={() => setSelectedVideo(null)}
                        className="absolute -top-12 right-0 text-white hover:text-brand-yellow flex items-center gap-2 group transition-colors"
                    >
                        <span className="text-[10px] font-black tracking-widest uppercase">Fechar Vídeo</span>
                        <X size={24} />
                    </button>

                    {embedUrl ? (
                        <iframe 
                            src={embedUrl}
                            className="w-full h-full"
                            allow="autoplay; fullscreen; picture-in-picture" 
                            allowFullScreen
                            title={selectedVideo.name}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500">
                             <p className="text-[10px] font-black tracking-widest uppercase">Link de vídeo inválido</p>
                        </div>
                    )}

                    <div className="absolute top-full left-0 mt-4 text-left">
                        <h2 className="text-brand-yellow text-[10px] font-black tracking-[0.4em] uppercase mb-1">Agora assistindo</h2>
                        <h1 className="text-white text-2xl font-black tracking-tighter uppercase">{selectedVideo.name}</h1>
                    </div>
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
