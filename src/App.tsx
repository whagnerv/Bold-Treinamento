import { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import TrainingGrid from './components/TrainingGrid';
import FeedbackSection from './components/FeedbackSection';
import ContactForm from './components/ContactForm';
import AdminDashboard from './components/AdminDashboard';
import { VideoItem } from './types';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const saved = localStorage.getItem('admin_videos');
    if (saved) return JSON.parse(saved);
    
    return [
      { 
        id: '1', 
        name: 'CONFIGURAÇÃO DE FUNIL KOMMO', 
        link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
        createdAt: Date.now(), 
        image: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg' 
      },
      { 
        id: '2', 
        name: 'ESTRATÉGIAS DE FECHAMENTO', 
        link: 'https://www.youtube.com/watch?v=9bZkp7q19f0', 
        createdAt: Date.now() - 86400000, 
        image: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg' 
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('admin_videos', JSON.stringify(videos));
  }, [videos]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const filteredVideos = videos.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black text-white dark' : 'bg-zinc-50 text-zinc-900'}`}>
      <div className="p-4 md:p-8">
        {/* Structural Frame */}
        <div className={`min-h-[calc(100vh-4rem)] border-[12px] relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'border-zinc-900 bg-black' : 'border-zinc-200 bg-white shadow-xl'}`}>
          {/* Background Image with Blur */}
          <div 
            className={`absolute inset-0 bg-cover bg-center grayscale blur-[2px] scale-105 transition-opacity duration-700 ${isDarkMode ? 'opacity-80' : 'opacity-40'}`}
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop")' }}
          />
          <div className={`absolute inset-0 transition-colors duration-300 ${isDarkMode ? 'bg-gradient-to-b from-black/50 via-black/20 to-black/50' : 'bg-gradient-to-b from-white/60 via-white/30 to-white/60'}`} />

          {/* Left Side Labels */}
          <div className="hidden lg:flex fixed left-10 top-1/2 -translate-y-1/2 flex-col gap-24 pointer-events-none z-50">
            <div className={`rotate-[-90deg] origin-left whitespace-nowrap text-[9px] tracking-[0.5em] font-bold uppercase transition-opacity ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}>
              Performance Excellence
            </div>
            <div className={`rotate-[-90deg] origin-left whitespace-nowrap text-[9px] tracking-[0.5em] font-bold uppercase transition-opacity ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}>
              Since 2024
            </div>
          </div>

          <main className="relative">
            {isAdminLoggedIn ? (
              <AdminDashboard 
                isDarkMode={isDarkMode} 
                onLogout={() => setIsAdminLoggedIn(false)} 
                videos={videos}
                setVideos={setVideos}
              />
            ) : (
              <>
                <Header 
                  isDarkMode={isDarkMode} 
                  onToggleTheme={toggleTheme} 
                  onLoginSuccess={() => setIsAdminLoggedIn(true)} 
                />
                <SearchSection onSearch={setSearchQuery} />
                <TrainingGrid videos={filteredVideos} />
                <FeedbackSection />
                <ContactForm />
              </>
            )}
          </main>

          {/* Bottom Deco */}
          <div className={`py-10 flex items-center justify-center gap-4 transition-opacity ${isDarkMode ? 'opacity-20' : 'opacity-10'}`}>
            <div className="w-12 h-[1px] bg-zinc-700"></div>
            <div className="text-[9px] font-bold tracking-[0.2em] uppercase">Universo Bold • Treinamento de Elite</div>
            <div className="w-12 h-[1px] bg-zinc-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
