import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Play, ExternalLink, Music, Save, Heart } from "lucide-react";
import { GeneratedPlaylist, SpotifyTrack } from "@/types/music";
import { searchMultipleSpotifyTracks } from "@/services/spotify";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Playlists() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<GeneratedPlaylist[]>([]);
  const [spotifyTracks, setSpotifyTracks] = useState<Record<string, SpotifyTrack[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const state = location.state as { playlists: GeneratedPlaylist[] } | null;
    
    if (!state?.playlists) {
      navigate('/');
      return;
    }

    setPlaylists(state.playlists);
    loadSpotifyTracks(state.playlists);
  }, [location.state, navigate]);

  const loadSpotifyTracks = async (playlistsData: GeneratedPlaylist[]) => {
    setIsLoading(true);
    const tracks: Record<string, SpotifyTrack[]> = {};

    try {
      for (const playlist of playlistsData) {
        const spotifyTracksForPlaylist = await searchMultipleSpotifyTracks(playlist.songs);
        tracks[playlist.category] = spotifyTracksForPlaylist;
      }
      setSpotifyTracks(tracks);
    } catch (error) {
      console.error('Error loading Spotify tracks:', error);
      toast({
        title: "Error loading tracks",
        description: "Some tracks may not be available",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayTrack = (track: SpotifyTrack) => {
    if (track.preview_url) {
      // Play preview if available
      const audio = new Audio(track.preview_url);
      audio.play().catch(console.error);
    } else {
      // Open in Spotify
      window.open(track.external_urls.spotify, '_blank');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Mix: "from-purple-500 to-pink-500",
      Focus: "from-blue-500 to-cyan-500", 
      Motivation: "from-orange-500 to-red-500",
      Emotional: "from-indigo-500 to-purple-500",
      Workout: "from-green-500 to-emerald-500"
    };
    return colors[category as keyof typeof colors] || "from-gray-500 to-gray-600";
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      Mix: "🎭",
      Focus: "🧠",
      Motivation: "💪",
      Emotional: "❤️",
      Workout: "🏋️"
    };
    return icons[category as keyof typeof icons] || "🎵";
  };

  const handleSavePlaylists = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save your playlists",
          variant: "destructive",
        });
        return;
      }

      const promises = playlists.map(playlist => 
        supabase.from('saved_playlists').insert({
          user_id: user.id,
          category: playlist.category,
          songs: playlist.songs,
          generated_at: playlist.generatedAt || new Date().toISOString()
        })
      );

      await Promise.all(promises);
      
      toast({
        title: "Playlists saved!",
        description: "Your AI-generated playlists have been saved to your library",
      });
      
      setShowSavePrompt(false);
    } catch (error) {
      console.error('Error saving playlists:', error);
      toast({
        title: "Error saving playlists",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    // Show save prompt after playlists are loaded and tracks are fetched
    if (playlists.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        setShowSavePrompt(true);
      }, 2000); // Show after 2 seconds to let user browse first
      
      return () => clearTimeout(timer);
    }
  }, [playlists.length, isLoading]);

  if (playlists.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No playlists found</h2>
          <p className="text-muted-foreground mb-4">Generate some playlists first</p>
          <Button onClick={() => navigate('/')}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-glow border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Your AI-Generated Playlists
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover personalized music across different moods and activities
            </p>
          </div>
        </div>
      </div>

      {/* Playlists */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue={playlists[0]?.category} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            {playlists.map((playlist) => (
              <TabsTrigger
                key={playlist.category}
                value={playlist.category}
                className="flex items-center gap-2"
              >
                <span>{getCategoryIcon(playlist.category)}</span>
                {playlist.category}
              </TabsTrigger>
            ))}
          </TabsList>

          {playlists.map((playlist) => (
            <TabsContent key={playlist.category} value={playlist.category}>
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${getCategoryColor(playlist.category)} flex items-center justify-center text-2xl`}>
                    {getCategoryIcon(playlist.category)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{playlist.category} Playlist</h2>
                    <p className="text-muted-foreground">
                      {spotifyTracks[playlist.category]?.length || playlist.songs.length} tracks
                    </p>
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(spotifyTracks[playlist.category] || []).map((track, index) => (
                      <div
                        key={track.id}
                        className="group flex items-center gap-4 p-4 bg-card/30 rounded-lg hover:bg-card/50 transition-smooth"
                      >
                        <div className="text-sm text-muted-foreground w-8">
                          {index + 1}
                        </div>
                        
                        <img
                          src={track.album.images[0]?.url || 'https://via.placeholder.com/64x64'}
                          alt={`${track.name} artwork`}
                          className="w-12 h-12 rounded object-cover"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {track.name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artists.map(artist => artist.name).join(', ')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handlePlayTrack(track)}
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            onClick={() => window.open(track.external_urls.spotify, '_blank')}
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Save Confirmation Prompt */}
        {showSavePrompt && (
          <Card className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Love these playlists?</h3>
                  <p className="text-muted-foreground">Save them to your library to access anytime</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowSavePrompt(false)}
                  disabled={isSaving}
                >
                  Maybe Later
                </Button>
                <Button
                  onClick={handleSavePlaylists}
                  disabled={isSaving}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Playlists"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}