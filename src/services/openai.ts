import { GeneratedPlaylist } from "@/types/music";

export const generatePlaylistsWithOpenAI = async (likedSongs: string[]): Promise<GeneratedPlaylist[]> => {
  try {
    const response = await fetch('/api/generate-playlists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ likedSongs }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate playlists');
    }

    const data = await response.json();
    return data.playlists;
  } catch (error) {
    console.error('Error generating playlists:', error);
    throw error;
  }
};