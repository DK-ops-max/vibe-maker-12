import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { likedSongs } = await req.json();

    if (!likedSongs || !Array.isArray(likedSongs) || likedSongs.length === 0) {
      throw new Error('Invalid or empty likedSongs array');
    }

    console.log('Generating playlists for songs:', likedSongs);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are a music expert who analyzes user music taste and creates personalized playlists. Return your response in JSON format with exactly 5 categories: Mix, Focus, Motivation, Emotional, Workout. Each category should have exactly 25 songs in "Artist - Song Name" format. Make sure to analyze the user\'s taste from their liked songs and create truly personalized recommendations that match their musical preferences, genres, and style.'
          },
          {
            role: 'user',
            content: `Based on these songs I love: ${likedSongs.join(', ')}, create 5 personalized playlists with 25 songs each that match my specific taste:

1. Mix: A diverse mix based on my taste, including similar artists and genres
2. Focus: Concentration and work music that matches my style  
3. Motivation: Upbeat and inspiring tracks I'd enjoy based on my preferences
4. Emotional: Deep, meaningful songs that resonate with my musical taste
5. Workout: High-energy exercise music matching my preferred genres and energy level

Return as JSON: {"Mix": ["Artist - Song", ...], "Focus": ["Artist - Song", ...], "Motivation": ["Artist - Song", ...], "Emotional": ["Artist - Song", ...], "Workout": ["Artist - Song", ...]}`
          }
        ],
        max_tokens: 3000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');
    
    const content = data.choices[0].message.content;
    
    // Parse JSON response
    const playlistData = JSON.parse(content);
    
    // Convert to our format
    const playlists = [
      { category: 'Mix', songs: playlistData.Mix },
      { category: 'Focus', songs: playlistData.Focus },
      { category: 'Motivation', songs: playlistData.Motivation },
      { category: 'Emotional', songs: playlistData.Emotional },
      { category: 'Workout', songs: playlistData.Workout }
    ];

    console.log('Playlists generated successfully');

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