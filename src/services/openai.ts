import { GeneratedPlaylist } from "@/types/music";

export const generatePlaylistsWithOpenAI = async (likedSongs: string[]): Promise<GeneratedPlaylist[]> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a music expert who analyzes user music taste and creates personalized playlists. Return your response in JSON format with exactly 5 categories: Mix, Focus, Motivation, Emotional, Workout. Each category should have exactly 25 songs in "Artist - Song Name" format.'
          },
          {
            role: 'user',
            content: `Based on these songs I love: ${likedSongs.join(', ')}, create 5 personalized playlists with 25 songs each:

1. Mix: A diverse mix based on my taste
2. Focus: Concentration and work music that matches my style  
3. Motivation: Upbeat and inspiring tracks I'd enjoy
4. Emotional: Deep, meaningful songs that resonate with me
5. Workout: High-energy exercise music I'd love

Return as JSON: {"Mix": ["Artist - Song", ...], "Focus": ["Artist - Song", ...], "Motivation": ["Artist - Song", ...], "Emotional": ["Artist - Song", ...], "Workout": ["Artist - Song", ...]}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate playlists with OpenAI');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    const playlistData = JSON.parse(content);
    
    // Convert to our format
    const playlists: GeneratedPlaylist[] = [
      { category: 'Mix', songs: playlistData.Mix },
      { category: 'Focus', songs: playlistData.Focus },
      { category: 'Motivation', songs: playlistData.Motivation },
      { category: 'Emotional', songs: playlistData.Emotional },
      { category: 'Workout', songs: playlistData.Workout }
    ];

    return playlists;
  } catch (error) {
    console.error('Error generating playlists:', error);
    throw error;
  }
};