import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchBar } from "./SearchBar";
import { SongCard } from "./SongCard";
import { PlaylistPanel } from "./PlaylistPanel";
import { Song, SearchResponse } from "@/types/music";
import { useToast } from "@/hooks/use-toast";
import { generatePlaylistsAPI } from "@/api/generate-playlists";
import { Button } from "./ui/button";
import { Music, Play, Sparkles, Headphones } from "lucide-react";

export const MusicApp = () => {
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTest, setShowTest] = useState(false);
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

  if (!showTest) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="wave-animation absolute inset-0 opacity-20"></div>
          <div className="equalizer-glow absolute inset-0 opacity-30"></div>
        </div>

        {/* Header with Logo */}
        <div className="relative z-10">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-foreground">Loomi</span>
            </div>
          </div>

          {/* Hero Section */}
          <div className="max-w-6xl mx-auto px-6 py-20 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Music className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
                Playlists that feel what you{" "}
                <span className="bg-gradient-primary bg-clip-text text-transparent">feel</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
                Unlock the science behind your music taste. Get personalized playlists that match your unique musical personality.
              </p>
            </div>

            <Button 
              onClick={() => setShowTest(true)}
              size="lg"
              className="bg-gradient-primary hover:opacity-90 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-glow transition-all duration-300 hover:scale-105 mb-4"
            >
              <Play className="w-5 h-5 mr-2" />
              Take the Music Taste Test
            </Button>
            
            <p className="text-sm text-muted-foreground">
              ✨ Free • No signup required • 2 minutes
            </p>
          </div>

          {/* How It Works Section */}
          <div className="max-w-6xl mx-auto px-6 pb-20">
            <h2 className="text-3xl font-bold text-center text-foreground mb-16">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Music className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">1. Choose Your Favorites</h3>
                <p className="text-muted-foreground">
                  Search and select songs you love. We analyze the musical DNA of your choices to understand your taste.
                </p>
              </div>

              <div className="text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">2. AI Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI examines genres, tempo, mood, and energy to create your unique musical fingerprint.
                </p>
              </div>

              <div className="text-center p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Headphones className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">3. Personalized Playlists</h3>
                <p className="text-muted-foreground">
                  Get 5 curated playlists: All-time Mix, Focus Mode, Motivational, Emotional, and Workout Energy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Logo and Back Button */}
      <div className="relative overflow-hidden bg-gradient-glow border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Loomi</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowTest(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back to Home
            </Button>
          </div>
          
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
                  Find Songs You Love
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