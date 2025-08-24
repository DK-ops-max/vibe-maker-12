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
  category: 'Mix' | 'Focus' | 'Motivation' | 'Emotional' | 'Workout';
  songs: string[];
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