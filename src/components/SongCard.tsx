import { Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Song } from "@/types/music";

interface SongCardProps {
  song: Song;
  onAddToPlaylist: (song: Song) => void;
  isInPlaylist?: boolean;
}

export const SongCard = ({ song, onAddToPlaylist, isInPlaylist }: SongCardProps) => {
  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="group relative p-4 bg-gradient-secondary border-border/50 
                   hover:border-primary/30 transition-smooth shadow-card
                   hover:shadow-glow hover:scale-[1.02] transform">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <img
            src={song.artworkUrl100}
            alt={`${song.trackName} artwork`}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                        transition-opacity rounded-lg flex items-center justify-center">
            <Play className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate mb-1">
            {song.trackName}
          </h3>
          <p className="text-muted-foreground text-sm truncate mb-1">
            {song.artistName}
          </p>
          <p className="text-muted-foreground/70 text-xs truncate">
            {song.collectionName} • {song.primaryGenreName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground">
            {formatDuration(song.trackTimeMillis)}
          </span>
          <Button
            onClick={() => onAddToPlaylist(song)}
            disabled={isInPlaylist}
            size="sm"
            variant={isInPlaylist ? "secondary" : "default"}
            className={isInPlaylist 
              ? "opacity-50 cursor-not-allowed" 
              : "bg-gradient-primary hover:shadow-glow transition-smooth"
            }
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};