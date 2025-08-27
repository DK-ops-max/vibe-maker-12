export interface Song {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackTimeMillis: number;
  primaryGenreName: string;
}

export interface SearchResponse {
  resultCount: number;
  results: Song[];
}

export interface GeneratedPlaylist {
  id?: string;
  category: 'Mix' | 'Focus' | 'Motivation' | 'Emotional' | 'Workout';
  songs: string[];
  generatedAt?: string;
}

export interface SavedPlaylist {
  id: string;
  user_id: string;
  category: string;
  songs: string[];
  generated_at: string;
  created_at: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  preview_url: string | null;
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}