import { GeneratedPlaylist, SavedPlaylist } from "@/types/music";
import { supabase } from "@/integrations/supabase/client";

export const generatePlaylistsWithOpenAI = async (likedSongs: string[]): Promise<GeneratedPlaylist[]> => {
  try {
    console.log('Calling Supabase edge function for playlist generation...', likedSongs);
    
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.id || 'Not logged in');
    
    console.log('Invoking generate-playlists function...');
    const { data, error } = await supabase.functions.invoke('generate-playlists', {
      body: { likedSongs }
    });

    console.log('Function response:', { data, error });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to generate playlists: ${error.message}`);
    }

    if (!data || !data.playlists) {
      throw new Error('Invalid response from playlist generation service');
    }

    // Save playlists to database if user is logged in
    if (user && data.playlists) {
      try {
        const playlistsToSave = data.playlists.map((playlist: GeneratedPlaylist) => ({
          user_id: user.id,
          category: playlist.category,
          songs: playlist.songs,
          generated_at: playlist.generatedAt || new Date().toISOString()
        }));

        const { error: saveError } = await supabase
          .from('saved_playlists')
          .insert(playlistsToSave);

        if (saveError) {
          console.error('Error saving playlists:', saveError);
        } else {
          console.log('Playlists saved to database successfully');
        }
      } catch (saveError) {
        console.error('Error saving playlists:', saveError);
      }
    }

    console.log('Playlists generated successfully via Supabase');
    return data.playlists;
  } catch (error) {
    console.error('Error generating playlists:', error);
    throw error;
  }
};

export const getSavedPlaylists = async (): Promise<SavedPlaylist[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('saved_playlists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved playlists:', error);
      return [];
    }

    // Cast the data properly to match SavedPlaylist interface
    const savedPlaylists: SavedPlaylist[] = (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      category: item.category,
      songs: Array.isArray(item.songs) ? (item.songs as string[]) : [],
      generated_at: item.generated_at,
      created_at: item.created_at
    }));

    return savedPlaylists;
  } catch (error) {
    console.error('Error fetching saved playlists:', error);
    return [];
  }
};