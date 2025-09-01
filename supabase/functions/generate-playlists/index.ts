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
  
  // Improved GPT prompt for playlist generation
  const prompt = `
You are a professional music curator.  
Analyze the following liked songs and then generate 5 personalized playlists with exactly 20 unique songs each.  

LIKED SONGS:
${likedSongs.map(song => `- ${song}`).join('\n')}

Guidelines:
- Base all choices on the user's liked songs (style, genre, mood, tempo).  
- MUST include 3-5 of the user's actual liked songs in each playlist (distributed across different playlists).
- Avoid repeating songs across playlists.  
- Include a balance of familiar artists and a few fresh but related discoveries.  
- Each playlist must have its own distinct mood/energy, but still align with the user's taste.  
- Give each playlist a short 1–2 sentence description explaining why these songs were chosen.

Playlists to create:
1. **Mix** – A diverse blend reflecting the user's overall taste.  
2. **Focus** – Calmer, smoother tracks ideal for concentration and studying.  
3. **Motivation** – Upbeat and energetic songs to boost productivity.  
4. **Emotional** – Soulful, meaningful, or deeper tracks for reflection.  
5. **Workout** – High-energy songs with strong rhythm for exercise.  

Output Format:
Return the results in **structured JSON**:
{
  "Mix": {
    "description": "Short description of why these songs were chosen",
    "songs": ["Song - Artist", "Song - Artist", ...20 items]
  },
  "Focus": {
    "description": "Short description of why these songs were chosen",
    "songs": ["Song - Artist", "Song - Artist", ...20 items]
  },
  "Motivation": {
    "description": "Short description of why these songs were chosen",
    "songs": ["Song - Artist", "Song - Artist", ...20 items]
  },
  "Emotional": {
    "description": "Short description of why these songs were chosen",
    "songs": ["Song - Artist", "Song - Artist", ...20 items]
  },
  "Workout": {
    "description": "Short description of why these songs were chosen",
    "songs": ["Song - Artist", "Song - Artist", ...20 items]
  }
}
`;

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
    let playlistsData;
    try {
      // Clean up the response to extract JSON object
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      playlistsData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('AI response was:', aiResponse);
      throw new Error('Failed to parse AI recommendation response');
    }
    
    // Convert object format to array format expected by frontend
    const playlists = Object.entries(playlistsData).map(([category, data]: [string, any]) => ({
      category,
      songs: data.songs || [],
      description: data.description || ''
    }));
    
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