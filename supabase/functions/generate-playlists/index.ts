import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// AI-powered personalized playlist generation
async function generatePersonalizedPlaylists(likedSongs: string[]) {
  console.log('Generating AI-powered personalized playlists for:', likedSongs);
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  // Create a detailed prompt based on user's music taste
  const prompt = `Analyze these liked songs and create 5 personalized playlists with exactly 20 songs each:

LIKED SONGS:
${likedSongs.map(song => `- ${song}`).join('\n')}

Based on the user's music taste from their liked songs, generate 5 playlists:
1. "Mix" - A diverse mix matching their overall taste
2. "Focus" - Calmer songs for concentration 
3. "Motivation" - Energetic songs for productivity
4. "Emotional" - Deeper, more emotional tracks
5. "Workout" - High-energy songs for exercise

For each playlist, recommend 20 real songs (Artist - Song Title format) that match:
- The user's preferred genres and artists
- Similar vibes to their liked songs
- The specific mood of each playlist category

Only recommend songs that actually exist by real artists. Prioritize popular/well-known songs when possible.

Return ONLY a valid JSON array in this exact format:
[
  {
    "category": "Mix",
    "songs": ["Artist Name - Song Title", "Artist Name - Song Title", ...20 songs total]
  },
  {
    "category": "Focus", 
    "songs": ["Artist Name - Song Title", "Artist Name - Song Title", ...20 songs total]
  },
  {
    "category": "Motivation",
    "songs": ["Artist Name - Song Title", "Artist Name - Song Title", ...20 songs total]
  },
  {
    "category": "Emotional",
    "songs": ["Artist Name - Song Title", "Artist Name - Song Title", ...20 songs total]
  },
  {
    "category": "Workout",
    "songs": ["Artist Name - Song Title", "Artist Name - Song Title", ...20 songs total]
  }
]`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system', 
            content: 'You are a music recommendation expert. Generate personalized playlists based on user preferences. Return only valid JSON with real songs.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.8
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI response received:', aiResponse.substring(0, 200) + '...');
    
    // Parse AI response
    let playlists;
    try {
      // Clean up the response to extract JSON
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      playlists = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI response was:', aiResponse);
      throw new Error('Failed to parse AI recommendation response');
    }
    
    // Add metadata to playlists
    const generationId = Date.now();
    return playlists.map((playlist: any, index: number) => ({
      ...playlist,
      id: `${playlist.category.toLowerCase()}-${generationId}-${index}`,
      generatedAt: new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { likedSongs } = await req.json();

    if (!likedSongs || !Array.isArray(likedSongs) || likedSongs.length === 0) {
      throw new Error('Invalid or empty likedSongs array');
    }

    console.log('Generating personalized playlists for songs:', likedSongs);

    // Use AI-powered personalized playlist generation
    const playlists = await generatePersonalizedPlaylists(likedSongs);

    console.log('AI-powered playlists generated successfully');

    return new Response(JSON.stringify({ playlists }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-playlists function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});