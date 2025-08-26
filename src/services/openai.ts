import { GeneratedPlaylist } from "@/types/music";
import { supabase } from "@/integrations/supabase/client";

export const generatePlaylistsWithOpenAI = async (likedSongs: string[]): Promise<GeneratedPlaylist[]> => {
  try {
    console.log('Calling Supabase edge function for playlist generation...');
    
    const { data, error } = await supabase.functions.invoke('generate-playlists', {
      body: { likedSongs }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to generate playlists: ${error.message}`);
    }

    if (!data || !data.playlists) {
      throw new Error('Invalid response from playlist generation service');
    }

    console.log('Playlists generated successfully via Supabase');
    return data.playlists;
  } catch (error) {
    console.error('Error generating playlists:', error);
    throw error;
  }
};