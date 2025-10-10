import { Search } from 'lucide-react';
import { ChangeEvent } from 'react';

interface GlobalSearchProps {
  onFilter: (value: string) => void;
}

const GlobalSearch = ({ onFilter }: GlobalSearchProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFilter(event.target.value);
  };

  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-card focus-within:ring-2 focus-within:ring-primary">
      <Search size={16} className="text-muted-foreground" />
      <input
        placeholder="Buscar dispositivo, IP o recurso"
        onChange={handleChange}
        className="w-72 bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
};

export default GlobalSearch;
