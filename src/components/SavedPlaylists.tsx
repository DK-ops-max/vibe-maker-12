import { useState, useEffect } from "react";
import { SavedPlaylist } from "@/types/music";
import { getSavedPlaylists } from "@/services/openai";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Calendar, Play, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SavedPlaylistsProps {
  onPlaylistSelect?: (playlist: SavedPlaylist) => void;
}

export const SavedPlaylists = ({ onPlaylistSelect }: SavedPlaylistsProps) => {
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    setIsLoading(true);
    try {
      const savedPlaylists = await getSavedPlaylists();
      setPlaylists(savedPlaylists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      const { error } = await supabase
        .from('saved_playlists')
        .delete()
        .eq('id', playlistId);

      if (error) {
        throw error;
      }

      setPlaylists(playlists.filter(p => p.id !== playlistId));
      toast({
        title: "Playlist deleted",
        description: "The playlist has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting playlist:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the playlist",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No saved playlists yet</h3>
        <p className="text-muted-foreground">
          Take the music taste test to generate your first personalized playlists!
        </p>
      </div>
    );
  }

  // Group playlists by generation session (same created_at date)
  const groupedPlaylists = playlists.reduce((groups, playlist) => {
    const date = new Date(playlist.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(playlist);
    return groups;
  }, {} as Record<string, SavedPlaylist[]>);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">Your Saved Playlists</h2>
        <p className="text-muted-foreground">
          Generated playlists based on your music taste analysis
        </p>
      </div>

      {Object.entries(groupedPlaylists).map(([date, sessionPlaylists]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Generated on {formatDate(sessionPlaylists[0].created_at)}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {sessionPlaylists.map((playlist) => (
              <Card key={playlist.id} className="p-4 bg-gradient-secondary border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-primary rounded-lg shadow-glow">
                      <Music className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{playlist.category}</h3>
                      <p className="text-xs text-muted-foreground">{playlist.songs.length} songs</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePlaylist(playlist.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive p-1 h-6 w-6"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-xs text-muted-foreground max-h-20 overflow-y-auto">
                    {playlist.songs.slice(0, 3).map((song, index) => (
                      <div key={index} className="truncate">
                        • {song}
                      </div>
                    ))}
                    {playlist.songs.length > 3 && (
                      <div className="text-muted-foreground/70">
                        +{playlist.songs.length - 3} more...
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPlaylistSelect?.(playlist)}
                  className="w-full bg-gradient-primary/10 hover:bg-gradient-primary/20 text-primary hover:text-primary-foreground transition-colors"
                >
                  <Play className="w-3 h-3 mr-2" />
                  View Playlist
                </Button>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};