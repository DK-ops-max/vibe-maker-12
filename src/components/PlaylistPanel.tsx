import { Music, Trash2, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Song } from "@/types/music";

interface PlaylistPanelProps {
  playlist: Song[];
  onRemoveFromPlaylist: (songId: number) => void;
  onGeneratePlaylists: () => void;
  isGenerating?: boolean;
}

export const PlaylistPanel = ({ playlist, onRemoveFromPlaylist, onGeneratePlaylists, isGenerating = false }: PlaylistPanelProps) => {
  const totalDuration = playlist.reduce((acc, song) => acc + song.trackTimeMillis, 0);
  
  const formatTotalDuration = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 bg-gradient-secondary border-border/50 shadow-card h-fit sticky top-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
          <Music className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">My Playlist</h2>
          <p className="text-sm text-muted-foreground">
            {playlist.length} songs • {formatTotalDuration(totalDuration)}
          </p>
        </div>
      </div>

      {playlist.length === 0 ? (
        <div className="text-center py-8">
          <Music className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="text-muted-foreground">No songs in playlist yet</p>
          <p className="text-sm text-muted-foreground/70">
            Search and add songs to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {playlist.map((song, index) => (
            <div
              key={`${song.trackId}-${index}`}
              className="group flex items-center gap-3 p-3 bg-card/30 rounded-lg
                       hover:bg-card/50 transition-smooth"
            >
              <img
                src={song.artworkUrl100}
                alt={`${song.trackName} artwork`}
                className="w-10 h-10 rounded object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {song.trackName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {song.artistName}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {formatDuration(song.trackTimeMillis)}
                </span>
                <Button
                  onClick={() => onRemoveFromPlaylist(song.trackId)}
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity
                           hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {playlist.length > 0 && (
        <div className="space-y-3 mt-4">
          <Button className="w-full bg-gradient-primary hover:shadow-glow transition-smooth">
            <Play className="w-4 h-4 mr-2" />
            Play Playlist
          </Button>
          
          <Button 
            onClick={onGeneratePlaylists}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Playlists
              </>
            )}
          </Button>
        </div>
      )}
    </Card>
  );
};