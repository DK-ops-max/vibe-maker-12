import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "./SearchBar";
import { SongCard } from "./SongCard";
import { PlaylistPanel } from "./PlaylistPanel";
import { Song, SearchResponse } from "@/types/music";
import { useToast } from "@/hooks/use-toast";
import { generatePlaylistsAPI } from "@/api/generate-playlists";

export const MusicApp = () => {
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const searchSongs = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=20`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();
      setSearchResults(data.results || []);
      
      if (data.results.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToPlaylist = (song: Song) => {
    if (playlist.length >= 10) {
      toast({
        title: "Maximum songs reached",
        description: "You can only select up to 10 songs for the test",
        variant: "destructive",
      });
      return;
    }
    
    if (!playlist.some(p => p.trackId === song.trackId)) {
      setPlaylist(prev => [...prev, song]);
      toast({
        title: "Added to test",
        description: `"${song.trackName}" by ${song.artistName} (${playlist.length + 1}/10)`,
      });
    }
  };

  const removeFromPlaylist = (songId: number) => {
    setPlaylist(prev => prev.filter(song => song.trackId !== songId));
    toast({
      title: "Removed from playlist",
      description: "Song removed successfully",
    });
  };

  const isInPlaylist = (songId: number) => {
    return playlist.some(song => song.trackId === songId);
  };

  const generatePlaylists = async () => {
    if (playlist.length < 5) {
      toast({
        title: "Need more songs",
        description: "Please select at least 5 songs to analyze your taste",
        variant: "destructive",
      });
      return;
    }

    if (playlist.length > 10) {
      toast({
        title: "Too many songs",
        description: "Please select no more than 10 songs for the best results",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const likedSongs = playlist.map(song => `${song.artistName} - ${song.trackName}`);
      const generatedPlaylists = await generatePlaylistsAPI(likedSongs);
      
      navigate('/playlists', { state: { playlists: generatedPlaylists } });
      
      toast({
        title: "Playlists generated!",
        description: "Your AI-powered playlists are ready",
      });
    } catch (error) {
      console.error("Error generating playlists:", error);
      toast({
        title: "Generation failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-glow border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Music Taste Test
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select 5-10 songs you love and let AI create personalized playlists for you
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              Selected: {playlist.length}/10 songs {playlist.length >= 5 && playlist.length <= 10 && "✓ Ready to generate!"}
            </div>
          </div>
          
          <SearchBar onSearch={searchSongs} isLoading={isLoading} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Results */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <h2 className="text-2xl font-semibold mb-6 text-foreground">
                  Search Results ({searchResults.length})
                </h2>
                <div className="space-y-4">
                  {searchResults.map((song) => (
                    <SongCard
                      key={song.trackId}
                      song={song}
                      onAddToPlaylist={addToPlaylist}
                      isInPlaylist={isInPlaylist(song.trackId)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🎧</div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">
                  Take Your Music Taste Test
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Search for songs you absolutely love and select 5-10 of them. 
                  Our AI will analyze your taste and create personalized playlists for different moods!
                </p>
              </div>
            )}
          </div>

          {/* Playlist Panel */}
          <div className="lg:col-span-1">
            <PlaylistPanel
              playlist={playlist}
              onRemoveFromPlaylist={removeFromPlaylist}
              onGeneratePlaylists={generatePlaylists}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
};