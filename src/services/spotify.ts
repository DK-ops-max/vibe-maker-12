import { SpotifyTrack } from "@/types/music";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || 'your_spotify_client_id';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';

let spotifyAccessToken: string | null = null;
let tokenExpirationTime = 0;

const getSpotifyAccessToken = async (): Promise<string | null> => {
  // Check if we have a valid token
  if (spotifyAccessToken && Date.now() < tokenExpirationTime) {
    return spotifyAccessToken;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error('Failed to get Spotify access token');
    }

    const data = await response.json();
    spotifyAccessToken = data.access_token;
    tokenExpirationTime = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute early

    return spotifyAccessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    return null;
  }
};

export const searchSpotifyTrack = async (trackName: string, artistName?: string): Promise<SpotifyTrack | null> => {
  try {
    const accessToken = await getSpotifyAccessToken();
    
    if (!accessToken || SPOTIFY_CLIENT_ID === 'your_spotify_client_id') {
      // Fallback to mock data if no valid token or client ID not set
      console.log(`Mock search for: ${trackName} by ${artistName}`);
      
      return {
        id: `mock-${Date.now()}-${Math.random()}`,
        name: trackName,
        artists: [{ name: artistName || 'Unknown Artist' }],
        album: {
          name: 'Unknown Album',
          images: [{ url: 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(trackName.substring(0, 10)) }]
        },
        preview_url: null,
        duration_ms: 180000 + Math.floor(Math.random() * 120000),
        external_urls: {
          spotify: `https://open.spotify.com/search/${encodeURIComponent(trackName + ' ' + (artistName || ''))}`
        }
      };
    }

    // Real Spotify API search
    const query = artistName ? `track:"${trackName}" artist:"${artistName}"` : `"${trackName}"`;
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Spotify API request failed');
    }

    const data = await response.json();
    const track = data.tracks?.items?.[0];

    if (!track) {
      return null;
    }

    return {
      id: track.id,
      name: track.name,
      artists: track.artists.map((artist: any) => ({ name: artist.name })),
      album: {
        name: track.album.name,
        images: track.album.images || [{ url: 'https://via.placeholder.com/300x300' }]
      },
      preview_url: track.preview_url,
      duration_ms: track.duration_ms,
      external_urls: track.external_urls
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