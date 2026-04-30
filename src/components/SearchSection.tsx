import { Search } from 'lucide-react';

interface SearchSectionProps {
  onSearch: (query: string) => void;
}

export default function SearchSection({ onSearch }: SearchSectionProps) {
  return (
    <section className="container mx-auto px-10 py-8">
      <div className="flex flex-col md:flex-row items-end justify-between border-b pb-12 gap-8 transition-colors duration-300 border-zinc-800 dark:border-zinc-800 border-zinc-200">
        <div className="flex-grow max-w-2xl w-full relative group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-brand-yellow group-focus-within:text-white dark:group-focus-within:text-white group-focus-within:text-zinc-900 transition-colors">
            <Search size={22} strokeWidth={3} />
          </div>
          <input 
            type="text" 
            placeholder="O QUE VOCÊ DESEJA APRENDER HOJE?"
            onChange={(e) => onSearch(e.target.value)}
            className="w-full transition-all duration-300 bg-zinc-900/50 dark:bg-zinc-900/50 bg-white text-zinc-900 dark:text-white py-6 pl-16 pr-8 text-sm font-black tracking-tighter uppercase border-l-4 border-brand-yellow outline-none focus:bg-zinc-900 dark:focus:bg-zinc-900 focus:bg-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 placeholder:font-bold border border-zinc-200 dark:border-transparent"
          />
          <div className="absolute bottom-0 left-0 w-0 h-[2px] transition-all duration-500 bg-zinc-900 dark:bg-white group-focus-within:w-full" />
        </div>
        
        <div className="hidden lg:block text-right">
          <span className="text-[10px] font-black tracking-[0.5em] uppercase transition-colors text-zinc-400 dark:text-zinc-600">Módulos Disponíveis</span>
          <div className="text-2xl font-[900] tracking-tighter transition-colors text-zinc-900 dark:text-white">CATÁLOGO BOLD</div>
        </div>
      </div>
    </section>
  );
}
