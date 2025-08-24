import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <Input
          type="text"
          placeholder="Search for songs, artists, albums..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-12 pr-4 py-4 text-lg bg-card/50 backdrop-blur-sm border-border/50 rounded-xl 
                   focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-smooth
                   placeholder:text-muted-foreground/70"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground/70 w-5 h-5" />
        <Button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2
                   bg-gradient-primary hover:shadow-glow transition-smooth
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
    </form>
  );
};