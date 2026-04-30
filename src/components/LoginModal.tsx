import { useState, FormEvent } from 'react';
import { X, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    // Credenciais fictícias
    if (email === 'admin@bold.com' && password === 'bold123') {
      onLoginSuccess();
      onClose();
      setError('');
    } else {
      setError('CREDENCIAIS INVÁLIDAS');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-4"
          >
            <div className="bg-zinc-900 border border-zinc-800 p-8 relative overflow-hidden">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 p-8 opacity-5 select-none pointer-events-none text-white">
                <Lock size={120} strokeWidth={3} />
              </div>

              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                type="button"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h2 className="text-[10px] font-black tracking-[0.4em] text-brand-yellow uppercase mb-2">Acesso Restrito</h2>
                <h1 className="text-3xl font-[900] tracking-tighter uppercase text-white">Administrador</h1>
                <p className="text-[10px] text-zinc-500 mt-2">Dica: admin@bold.com / bold123</p>
              </div>

              <form className="space-y-4" onSubmit={handleLogin}>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-brand-yellow transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="EMAIL DE ACESSO"
                    className="w-full bg-zinc-800/50 text-white py-4 pl-12 pr-4 text-xs font-bold tracking-widest uppercase border border-zinc-800 outline-none focus:border-brand-yellow transition-all placeholder:text-zinc-600"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-600 group-focus-within:text-brand-yellow transition-colors">
                    <Lock size={18} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="SENHA"
                    className="w-full bg-zinc-800/50 text-white py-4 pl-12 pr-12 text-xs font-bold tracking-widest uppercase border border-zinc-800 outline-none focus:border-brand-yellow transition-all placeholder:text-zinc-600"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-zinc-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="flex items-center justify-between py-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 border border-zinc-700 transition-colors ${rememberMe ? 'bg-brand-yellow border-brand-yellow' : 'bg-transparent'}`}>
                        {rememberMe && <ArrowRight size={10} className="text-black m-auto" />}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500 group-hover:text-zinc-300 transition-colors">Lembrar-me</span>
                  </label>
                  
                  <button type="button" className="text-[10px] font-bold tracking-widest uppercase text-zinc-600 hover:text-brand-yellow transition-colors">
                    Esqueceu a senha?
                  </button>
                </div>

                {error && (
                  <p className="text-red-500 text-[10px] font-black tracking-widest uppercase animate-pulse">
                    {error}
                  </p>
                )}

                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 py-5 bg-brand-yellow text-black font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-colors group mt-8"
                >
                  <span>Acessar Painel</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <p className="mt-8 text-center text-zinc-600 text-[9px] font-bold tracking-widest uppercase">
                Área exclusiva para treinadores bold
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
