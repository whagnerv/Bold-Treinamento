import { useState } from 'react';
import { LogIn, Moon, Sun } from 'lucide-react';
import LoginModal from './LoginModal';

interface HeaderProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onLoginSuccess: () => void;
}

export default function Header({ isDarkMode, onToggleTheme, onLoginSuccess }: HeaderProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <header className={`relative border-b pt-20 pb-12 overflow-hidden transition-colors duration-300 ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={onLoginSuccess}
      />
      {/* Background large text deco */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] select-none pointer-events-none transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <h1 className="text-[180px] md:text-[300px] font-[900] tracking-tighter leading-none">BOLD</h1>
      </div>

      <div className="container mx-auto px-10 relative z-10">
        <nav className="absolute top-[-40px] left-10 right-10 flex justify-between items-center">
           <div className={`text-xl font-[900] tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>BOLD<span className="text-brand-yellow">.</span></div>
           <div className="flex items-center gap-6">
             <button 
               onClick={onToggleTheme}
               className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-zinc-400 hover:text-brand-yellow hover:bg-zinc-900' : 'text-zinc-600 hover:text-brand-yellow hover:bg-zinc-100'}`}
               title={isDarkMode ? 'Modo Claro' : 'Modo Noturno'}
             >
               {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
             </button>
             <button 
               onClick={() => setIsLoginOpen(true)}
               className={`flex items-center gap-1 text-[10px] font-bold tracking-[0.3em] uppercase opacity-70 hover:text-brand-yellow transition-colors cursor-pointer outline-none ${isDarkMode ? 'text-white' : 'text-black'}`}
             >
               <LogIn size={12} />
               <span>Entrar</span>
             </button>
           </div>
        </nav>

        <div className="flex flex-col items-center text-center">
          <h2 className="text-[10px] font-bold tracking-[0.8em] text-brand-yellow uppercase mb-4 animate-in fade-in slide-in-from-bottom duration-500">
            Treinamento de Elite
          </h2>
          <h1 className={`text-5xl md:text-8xl font-[900] tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom duration-700 delay-100 uppercase transition-colors ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
            Bold Treinamento<br/><span className="text-brand-yellow">Kommo</span>
          </h1>
          <p className={`max-w-md mx-auto text-sm leading-relaxed mb-6 block md:hidden transition-colors ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
             Metodologias exclusivas focadas em alta performance.
          </p>
          <div className={`h-[1px] w-24 my-8 hidden md:block transition-colors ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
        </div>
      </div>
    </header>
  );
}
