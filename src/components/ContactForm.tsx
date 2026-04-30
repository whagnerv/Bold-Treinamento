import { useState } from 'react';
import { Send, ArrowUp } from 'lucide-react';
import { Feedback } from '../types';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    message: ''
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!formData.name.trim() || !formData.message.trim()) {
      alert('Por favor, preencha o nome e a mensagem.');
      return;
    }

    const newFeedback: Feedback = {
      id: Math.random().toString(36).substr(2, 9),
      user: `${formData.name.toUpperCase()}${formData.company ? ` - ${formData.company.toUpperCase()}` : ''}`,
      text: formData.message.toUpperCase(),
      createdAt: Date.now()
    };

    const saved = localStorage.getItem('app_feedbacks');
    const feedbacks = saved ? JSON.parse(saved) : [];
    const updatedFeedbacks = [newFeedback, ...feedbacks];
    
    localStorage.setItem('app_feedbacks', JSON.stringify(updatedFeedbacks));
    
    // Notify FeedbackSection
    window.dispatchEvent(new Event('app-feedback-updated'));
    
    setFormData({ name: '', company: '', message: '' });
    
    // Scroll to feedback section to show the result
    const feedbackSection = document.getElementById('feedback-section');
    if (feedbackSection) {
      feedbackSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="contact-form" className="container mx-auto px-10 py-20 border-t transition-colors duration-300 border-zinc-800 dark:border-zinc-800 border-zinc-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="text-left">
          <h2 className="text-[10px] font-bold tracking-[0.4em] text-brand-yellow uppercase mb-4">Contato</h2>
          <h1 className="text-4xl md:text-5xl font-[900] tracking-tighter uppercase mb-6 leading-none transition-colors text-zinc-900 dark:text-white">
            Deixe sua<br/>dúvida ou<br/>sugestão
          </h1>
          <p className="text-sm max-w-xs transition-colors text-zinc-500 dark:text-zinc-500">
            Sua contribuição pode se tornar o próximo módulo da nossa plataforma de elite.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="NOME"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="py-4 px-6 text-xs font-bold tracking-widest uppercase border transition-all outline-none focus:border-brand-yellow placeholder:text-zinc-600 bg-zinc-900 dark:bg-zinc-900 bg-white text-zinc-900 dark:text-white border-zinc-800 dark:border-zinc-800"
            />
            <input 
              type="text" 
              placeholder="EMPRESA"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="py-4 px-6 text-xs font-bold tracking-widest uppercase border transition-all outline-none focus:border-brand-yellow placeholder:text-zinc-600 bg-zinc-900 dark:bg-zinc-900 bg-white text-zinc-900 dark:text-white border-zinc-800 dark:border-zinc-800"
            />
          </div>
          <div className="relative">
            <textarea 
              placeholder="MENSAGEM..."
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full py-4 px-6 text-xs font-bold tracking-widest uppercase border transition-all outline-none focus:border-brand-yellow placeholder:text-zinc-600 resize-none bg-zinc-900 dark:bg-zinc-900 bg-white text-zinc-900 dark:text-white border-zinc-800 dark:border-zinc-800"
            />
            <button 
              onClick={handleSend}
              className="flex items-center gap-2 mt-4 px-8 py-4 bg-brand-yellow text-black font-black text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-900 hover:text-brand-yellow dark:hover:bg-white dark:hover:text-black transition-colors ml-auto group"
            >
              <span>Enviar agora</span>
              <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <button 
        onClick={scrollToTop}
        className="fixed bottom-10 right-10 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase transition-all z-50 group mb-[-4px] opacity-30 hover:opacity-100 text-zinc-900 dark:text-white"
      >
        <span className="group-hover:-translate-y-1 transition-transform inline-block">Voltar ao topo</span>
        <ArrowUp size={16} />
      </button>
    </section>
  );
}
