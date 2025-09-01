import { SpotifyTrack } from "@/types/music";

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || 'your_spotify_client_id';
// Note: Client secret should be handled in backend/edge functions for security

export const searchSpotifyTrack = async (trackName: string, artistName?: string): Promise<SpotifyTrack | null> => {
  try {
    // For now, use mock implementation until Spotify credentials are properly configured
    // Real Spotify integration would require backend authentication for security
    console.log(`Mock search for: ${trackName} by ${artistName}`);
    
    // Enhanced mock data with better variety
    const mockImageUrl = `https://picsum.photos/300/300?random=${Math.floor(Math.random() * 1000)}`;
    
    return {
      id: `mock-${Date.now()}-${Math.random()}`,
      name: trackName,
      artists: [{ name: artistName || 'Unknown Artist' }],
      album: {
        name: 'Unknown Album',
        images: [{ url: mockImageUrl }]
      },
      preview_url: null,
      duration_ms: 180000 + Math.floor(Math.random() * 120000),
      external_urls: {
        spotify: `https://open.spotify.com/search/${encodeURIComponent(trackName + ' ' + (artistName || ''))}`
      }
    };
  } catch (error) {
    console.error('Error searching Spotify:', error);
    return null;
  }
};

export const searchMultipleSpotifyTracks = async (songs: string[]): Promise<SpotifyTrack[]> => {
  const tracks: SpotifyTrack[] = [];
  
  for (const song of songs) {
    // Parse "Artist - Song" format
    const parts = song.split(' - ');
    const artistName = parts.length > 1 ? parts[0] : undefined;
    const trackName = parts.length > 1 ? parts[1] : song;
    
    const track = await searchSpotifyTrack(trackName, artistName);
    if (track) {
      tracks.push(track);
    }
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return tracks;
};