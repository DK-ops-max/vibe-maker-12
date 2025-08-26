import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Language detection function
function detectLanguage(songName: string, artistName: string): string {
  const text = `${songName} ${artistName}`.toLowerCase();
  
  // Hindi indicators
  const hindiIndicators = [
    'tum', 'hai', 'dil', 'aaj', 'kya', 'tere', 'tera', 'mera', 'hum', 'main', 'yeh', 'woh',
    'sapna', 'pyaar', 'mohabbat', 'ishq', 'zindagi', 'khushi', 'gham', 'raat', 'din',
    'chand', 'sitara', 'aansu', 'hasna', 'rona', 'saath', 'judaai', 'milan', 'safar'
  ];
  
  // Spanish indicators  
  const spanishIndicators = [
    'mi', 'tu', 'el', 'la', 'en', 'de', 'que', 'yo', 'te', 'me', 'se', 'con', 'para',
    'amor', 'vida', 'corazón', 'noche', 'día', 'tiempo', 'siempre', 'nunca', 'todo'
  ];
  
  // French indicators
  const frenchIndicators = [
    'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'le', 'la', 'les', 'de', 'du',
    'amour', 'vie', 'coeur', 'nuit', 'jour', 'temps', 'toujours', 'jamais', 'tout'
  ];

  // Korean indicators (romanized)
  const koreanIndicators = [
    'sarang', 'neo', 'na', 'uri', 'babo', 'hajima', 'oneul', 'nae', 'geudae', 'kkum',
    'maeum', 'nunmul', 'haengbok', 'apeum', 'gieok', 'jeongmal', 'mianhae', 'gomawo'
  ];

  // Japanese indicators (romanized)
  const japaneseIndicators = [
    'watashi', 'anata', 'kimi', 'boku', 'ore', 'kokoro', 'ai', 'yume', 'koi', 'namida',
    'shiawase', 'kanashii', 'ureshii', 'sayonara', 'arigatou', 'suki', 'daisuki'
  ];

  const hindiCount = hindiIndicators.filter(word => text.includes(word)).length;
  const spanishCount = spanishIndicators.filter(word => text.includes(word)).length;
  const frenchCount = frenchIndicators.filter(word => text.includes(word)).length;
  const koreanCount = koreanIndicators.filter(word => text.includes(word)).length;
  const japaneseCount = japaneseIndicators.filter(word => text.includes(word)).length;

  if (hindiCount > 0) return 'hindi';
  if (spanishCount > 0) return 'spanish';
  if (frenchCount > 0) return 'french';
  if (koreanCount > 0) return 'korean';
  if (japaneseCount > 0) return 'japanese';
  
  return 'english';
}

// Genre detection function
function detectGenre(songName: string, artistName: string): string {
  const text = `${songName} ${artistName}`.toLowerCase();
  
  const genreKeywords = {
    'bollywood': ['bollywood', 'hindi', 'arijit', 'shreya', 'sonu', 'alka', 'udit', 'kumar sanu', 'rahman'],
    'pop': ['pop', 'taylor', 'ariana', 'billie', 'dua', 'olivia', 'weeknd', 'bruno', 'ed sheeran'],
    'rock': ['rock', 'metal', 'guitar', 'band', 'linkin', 'coldplay', 'imagine dragons', 'maroon'],
    'hip-hop': ['hip hop', 'rap', 'drake', 'kendrick', 'eminem', 'kanye', 'travis', 'post malone'],
    'electronic': ['electronic', 'edm', 'dance', 'techno', 'house', 'calvin harris', 'david guetta'],
    'rnb': ['r&b', 'soul', 'beyonce', 'john legend', 'alicia keys', 'usher', 'chris brown'],
    'indie': ['indie', 'alternative', 'arctic monkeys', 'vampire weekend', 'tame impala'],
    'classical': ['classical', 'orchestra', 'symphony', 'piano', 'violin', 'bach', 'mozart'],
    'jazz': ['jazz', 'blues', 'swing', 'saxophone', 'trumpet', 'ella fitzgerald', 'louis armstrong'],
    'kpop': ['bts', 'blackpink', 'twice', 'stray kids', 'itzy', 'aespa', 'newjeans', 'ive']
  };
  
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return genre;
    }
  }
  
  return 'pop';
}

// Comprehensive song database by language and genre
const songDatabase = {
  hindi: {
    bollywood: [
      "Arijit Singh - Tum Hi Ho", "Shreya Ghoshal - Nagada Sang Dhol", "Sonu Nigam - Kal Ho Naa Ho",
      "Arijit Singh - Ae Dil Hai Mushkil", "A.R. Rahman - Enna Sona", "Arijit Singh - Hamari Adhuri Kahani",
      "Shreya Ghoshal - Deewani Mastani", "Rahat Fateh Ali Khan - Jag Ghoomeya", "Armaan Malik - Bol Do Na Zara",
      "Atif Aslam - Jeene Laga Hoon", "Arijit Singh - Channa Mereya", "Shreya Ghoshal - Ghoomar",
      "Sonu Nigam - Abhi Mujh Mein Kahin", "Arijit Singh - Hawayein", "Sunidhi Chauhan - Kamli",
      "Arijit Singh - Phir Bhi Tumko Chaahunga", "Shreya Ghoshal - Manwa Laage", "Rahat Fateh Ali Khan - Zaroori Tha",
      "Arijit Singh - Gerua", "Armaan Malik - Main Rahoon Ya Na Rahoon", "Atif Aslam - Pehli Nazar Mein",
      "Arijit Singh - Bolna", "Shreya Ghoshal - Samjhawan", "Sonu Nigam - Suraj Hua Maddham"
    ],
    pop: [
      "Diljit Dosanjh - G.O.A.T", "Badshah - Genda Phool", "Guru Randhawa - Lahore", "Honey Singh - Blue Eyes",
      "Diljit Dosanjh - Do You Know", "Badshah - DJ Waley Babu", "Guru Randhawa - High Rated Gabru",
      "Neha Kakkar - Oh Humsafar", "Tulsi Kumar - Tere Naal", "Asees Kaur - Bolna Halke Halke"
    ]
  },
  english: {
    pop: [
      "Ed Sheeran - Perfect", "Billie Eilish - Bad Guy", "Dua Lipa - Levitating", "The Weeknd - Blinding Lights",
      "Taylor Swift - Anti-Hero", "Harry Styles - As It Was", "Olivia Rodrigo - Good 4 U", "Bruno Mars - Just The Way You Are",
      "Ariana Grande - 7 rings", "Post Malone - Circles", "Dua Lipa - Don't Start Now", "The Weeknd - Can't Feel My Face",
      "Taylor Swift - Shake It Off", "Ed Sheeran - Shape of You", "Billie Eilish - Happier Than Ever",
      "Harry Styles - Watermelon Sugar", "Ariana Grande - Thank U, Next", "Bruno Mars - Uptown Funk",
      "Olivia Rodrigo - Drivers License", "Post Malone - Sunflower", "Dua Lipa - Physical", "The Weeknd - Save Your Tears",
      "Taylor Swift - Lover", "Ed Sheeran - Thinking Out Loud", "Billie Eilish - Ocean Eyes"
    ],
    rock: [
      "Imagine Dragons - Believer", "Coldplay - Viva La Vida", "OneRepublic - Counting Stars", "Maroon 5 - Sugar",
      "Linkin Park - In the End", "Coldplay - Fix You", "Imagine Dragons - Radioactive", "OneRepublic - Apologize",
      "Maroon 5 - Payphone", "Linkin Park - Numb", "Coldplay - The Scientist", "Imagine Dragons - Thunder"
    ],
    'hip-hop': [
      "Drake - God's Plan", "Kendrick Lamar - HUMBLE.", "Eminem - Lose Yourself", "Post Malone - White Iverson",
      "Travis Scott - SICKO MODE", "Drake - In My Feelings", "Kendrick Lamar - DNA.", "Eminem - Without Me"
    ],
    'rnb': [
      "John Legend - All of Me", "Beyoncé - Crazy in Love", "Alicia Keys - Fallin'", "Usher - Yeah!",
      "Chris Brown - Forever", "John Legend - Ordinary People", "Beyoncé - Halo", "Alicia Keys - If I Ain't Got You"
    ]
  },
  spanish: {
    pop: [
      "Bad Bunny - Tití Me Preguntó", "Rosalía - Con Altura", "J Balvin - Mi Gente", "Maluma - Felices los 4",
      "Ozuna - Baila Baila Baila", "Karol G - Tusa", "Sebastian Yatra - Traicionera", "Camila Cabello - Havana"
    ],
    reggaeton: [
      "Daddy Yankee - Gasolina", "Luis Fonsi - Despacito", "Bad Bunny - Yo Perreo Sola", "J Balvin - Ginza",
      "Maluma - Corazón", "Ozuna - Te Boté", "Karol G - Bichota", "Anuel AA - Ella Quiere Beber"
    ]
  },
  korean: {
    kpop: [
      "BTS - Dynamite", "BLACKPINK - DDU-DU DDU-DU", "NewJeans - Super Shy", "IVE - LOVE DIVE",
      "TWICE - The Feels", "Stray Kids - God's Menu", "ITZY - WANNABE", "aespa - Next Level",
      "BTS - Butter", "BLACKPINK - Kill This Love", "NewJeans - Attention", "IVE - Eleven"
    ]
  },
  japanese: {
    jpop: [
      "Kenshi Yonezu - Lemon", "Official HIGE DANdism - Pretender", "Aimyon - Marigold", "Yoasobi - Yoru ni Kakeru",
      "King Gnu - Hakujitsu", "LiSA - Gurenge", "Fujii Kaze - Shinunoga E-Wa", "Eve - Kaikai Kitan"
    ]
  },
  french: {
    pop: [
      "Stromae - Alors on Danse", "Christine and the Queens - Tilted", "Angèle - Balance ton quoi",
      "Indila - Dernière Danse", "Tal - Le Sens de la Vie", "Zaz - Je veux", "Louane - Avenir"
    ]
  }
};

// Smart playlist generation function with enhanced randomization
function generateSmartPlaylists(likedSongs: string[]) {
  console.log('Analyzing liked songs:', likedSongs);
  
  // Add timestamp for unique generation
  const generationId = Date.now();
  console.log('Generation ID:', generationId);
  
  // Analyze user preferences
  const analysis = {
    languages: {} as Record<string, number>,
    genres: {} as Record<string, number>,
    artists: {} as Record<string, number>
  };
  
  likedSongs.forEach(song => {
    const [artist, songName] = song.split(' - ');
    const language = detectLanguage(songName || '', artist || '');
    const genre = detectGenre(songName || '', artist || '');
    
    analysis.languages[language] = (analysis.languages[language] || 0) + 1;
    analysis.genres[genre] = (analysis.genres[genre] || 0) + 1;
    analysis.artists[artist] = (analysis.artists[artist] || 0) + 1;
  });
  
  console.log('Analysis result:', analysis);
  
  // Calculate proportions
  const totalSongs = likedSongs.length;
  const languageProportions = Object.entries(analysis.languages).map(([lang, count]) => ({
    language: lang,
    proportion: count / totalSongs
  }));
  
  console.log('Language proportions:', languageProportions);
  
  // Shuffle function for better randomization
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Generate playlists maintaining proportions with enhanced randomization
  const categories = ['Mix', 'Focus', 'Motivation', 'Emotional', 'Workout'];
  const playlists = categories.map((category, categoryIndex) => {
    const songs: string[] = [];
    const usedSongs = new Set<string>();
    const targetCount = 20; // Reduced to avoid repetition
    
    // Add category-specific seed for variation
    const categorySeed = generationId + categoryIndex * 1000;
    
    // Distribute songs by language proportion
    languageProportions.forEach(({ language, proportion }) => {
      const songsNeeded = Math.max(1, Math.round(targetCount * proportion));
      const availableGenres = Object.keys(songDatabase[language] || {});
      
      for (let i = 0; i < songsNeeded && songs.length < targetCount; i++) {
        // Select appropriate genre based on category with variation
        let possibleGenres = [...availableGenres];
        
        if (category === 'Workout' && availableGenres.includes('hip-hop')) {
          possibleGenres = ['hip-hop', ...availableGenres.filter(g => g !== 'hip-hop')];
        }
        if (category === 'Focus' && availableGenres.includes('classical')) {
          possibleGenres = ['classical', ...availableGenres.filter(g => g !== 'classical')];
        }
        if (category === 'Emotional' && availableGenres.includes('rnb')) {
          possibleGenres = ['rnb', ...availableGenres.filter(g => g !== 'rnb')];
        }
        if (category === 'Motivation' && availableGenres.includes('rock')) {
          possibleGenres = ['rock', ...availableGenres.filter(g => g !== 'rock')];
        }
        
        // Try multiple genres for variety
        for (const targetGenre of possibleGenres) {
          const genreSongs = songDatabase[language]?.[targetGenre] || [];
          if (genreSongs.length > 0) {
            const shuffledSongs = shuffleArray(genreSongs);
            
            // Try to find unused songs
            for (const song of shuffledSongs) {
              if (!usedSongs.has(song) && songs.length < targetCount) {
                songs.push(song);
                usedSongs.add(song);
                break;
              }
            }
            
            if (songs.length >= targetCount) break;
          }
        }
      }
    });
    
    // Fill remaining slots with variety from all available languages
    const allLanguages = Object.keys(songDatabase);
    let attempts = 0;
    const maxAttempts = 100;
    
    while (songs.length < targetCount && attempts < maxAttempts) {
      const randomLang = allLanguages[Math.floor(Math.random() * allLanguages.length)];
      const availableGenres = Object.keys(songDatabase[randomLang] || {});
      
      if (availableGenres.length > 0) {
        const randomGenre = availableGenres[Math.floor(Math.random() * availableGenres.length)];
        const genreSongs = songDatabase[randomLang]?.[randomGenre] || [];
        
        if (genreSongs.length > 0) {
          const shuffledSongs = shuffleArray(genreSongs);
          
          for (const song of shuffledSongs) {
            if (!usedSongs.has(song) && songs.length < targetCount) {
              songs.push(song);
              usedSongs.add(song);
              break;
            }
          }
        }
      }
      attempts++;
    }
    
    console.log(`Generated ${category} playlist with ${songs.length} songs`);
    return { 
      category, 
      songs: shuffleArray(songs.slice(0, targetCount)),
      generatedAt: new Date().toISOString(),
      id: `${category.toLowerCase()}-${generationId}-${categoryIndex}`
    };
  });
  
  return playlists;
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

    // Use our custom smart playlist generation
    const playlists = generateSmartPlaylists(likedSongs);

    console.log('Playlists generated successfully with language proportions maintained');

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