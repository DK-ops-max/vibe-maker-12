import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Improved language detection function
function detectLanguage(songName: string, artistName: string): string {
  const artist = artistName.toLowerCase();
  const song = songName.toLowerCase();
  
  // Known artists by language (more reliable than keyword matching)
  const artistLanguages = {
    'hindi': ['arijit singh', 'shreya ghoshal', 'sonu nigam', 'atif aslam', 'rahat fateh ali khan', 'armaan malik', 'sunidhi chauhan', 'alka yagnik', 'udit narayan', 'kumar sanu', 'kishore kumar', 'lata mangeshkar', 'mohammed rafi', 'asha bhosle', 'diljit dosanjh', 'badshah', 'guru randhawa', 'honey singh', 'neha kakkar', 'tulsi kumar', 'asees kaur'],
    'spanish': ['bad bunny', 'rosalía', 'j balvin', 'maluma', 'ozuna', 'karol g', 'sebastian yatra', 'daddy yankee', 'luis fonsi', 'anuel aa', 'shakira', 'manu chao', 'jesse & joy', 'mana', 'pablo alboran'],
    'korean': ['bts', 'blackpink', 'twice', 'stray kids', 'itzy', 'aespa', 'newjeans', 'ive', 'red velvet', 'girls generation', 'snsd', 'bigbang', 'exo', 'seventeen', 'nct', 'lisa', 'jennie', 'jisoo', 'rose'],
    'japanese': ['kenshi yonezu', 'official hige dandism', 'aimyon', 'yoasobi', 'king gnu', 'lisa', 'fujii kaze', 'eve', 'radwimps', 'one ok rock', 'x japan', 'babymetal'],
    'french': ['stromae', 'christine and the queens', 'angèle', 'indila', 'tal', 'zaz', 'louane', 'dadju', 'soprano', 'bigflo & oli']
  };
  
  // Check artist match first (most reliable)
  for (const [language, artists] of Object.entries(artistLanguages)) {
    if (artists.some(knownArtist => artist.includes(knownArtist))) {
      return language;
    }
  }
  
  // Only check keywords if no artist match and song contains clear non-English indicators
  const text = `${song} ${artist}`;
  
  // Strong Hindi indicators (only very specific words)
  const hindiIndicators = ['bollywood', 'dil', 'pyaar', 'ishq', 'zindagi', 'sapna', 'mohabbat'];
  const hindiCount = hindiIndicators.filter(word => text.includes(word)).length;
  
  // Strong Spanish indicators
  const spanishIndicators = ['reggaeton', 'corazón', 'amor', 'vida', 'noche', 'tiempo'];
  const spanishCount = spanishIndicators.filter(word => text.includes(word)).length;
  
  if (hindiCount > 1) return 'hindi';
  if (spanishCount > 1) return 'spanish';
  
  // Default to English for better accuracy
  return 'english';
}

// Enhanced genre detection function
function detectGenre(songName: string, artistName: string): string {
  const text = `${songName} ${artistName}`.toLowerCase();
  
  const genreKeywords = {
    'bollywood': ['arijit singh', 'shreya ghoshal', 'sonu nigam', 'atif aslam', 'rahat fateh ali khan', 'armaan malik', 'sunidhi chauhan', 'bollywood'],
    'pop': ['taylor swift', 'ariana grande', 'billie eilish', 'dua lipa', 'olivia rodrigo', 'the weeknd', 'bruno mars', 'ed sheeran', 'harry styles', 'benson boone', 'miley cyrus', 'selena gomez', 'justin bieber'],
    'rock': ['coldplay', 'imagine dragons', 'onerepublic', 'maroon 5', 'linkin park', 'foo fighters', 'red hot chili peppers', 'arctic monkeys', 'the killers', 'muse'],
    'hip-hop': ['drake', 'kendrick lamar', 'eminem', 'kanye west', 'travis scott', 'post malone', 'j. cole', 'future', 'lil wayne', 'jay-z', 'nas'],
    'electronic': ['calvin harris', 'david guetta', 'skrillex', 'deadmau5', 'tiesto', 'martin garrix', 'avicii', 'diplo', 'flume'],
    'rnb': ['beyoncé', 'john legend', 'alicia keys', 'usher', 'chris brown', 'the weeknd', 'frank ocean', 'sza', 'daniel caesar'],
    'indie': ['arctic monkeys', 'vampire weekend', 'tame impala', 'the strokes', 'foster the people', 'mgmt', 'alt-j', 'glass animals'],
    'reggaeton': ['bad bunny', 'j balvin', 'maluma', 'ozuna', 'daddy yankee', 'luis fonsi', 'karol g', 'anuel aa'],
    'kpop': ['bts', 'blackpink', 'twice', 'stray kids', 'itzy', 'aespa', 'newjeans', 'ive', 'red velvet', 'seventeen']
  };
  
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return genre;
    }
  }
  
  return 'pop';
}

// Expanded song database with more variety and better songs
const songDatabase = {
  hindi: {
    bollywood: [
      "Arijit Singh - Tum Hi Ho", "Shreya Ghoshal - Nagada Sang Dhol", "Sonu Nigam - Kal Ho Naa Ho",
      "Arijit Singh - Ae Dil Hai Mushkil", "A.R. Rahman - Enna Sona", "Arijit Singh - Hamari Adhuri Kahani",
      "Shreya Ghoshal - Deewani Mastani", "Rahat Fateh Ali Khan - Jag Ghoomeya", "Armaan Malik - Bol Do Na Zara",
      "Atif Aslam - Jeene Laga Hoon", "Arijit Singh - Channa Mereya", "Shreya Ghoshal - Ghoomar",
      "Sonu Nigam - Abhi Mujh Mein Kahin", "Arijit Singh - Hawayein", "Sunidhi Chauhan - Kamli",
      "Arijit Singh - Phir Bhi Tumko Chaahunga", "Shreya Ghoshal - Manwa Laage", "Rahat Fateh Ali Khan - Zaroori Tha"
    ],
    pop: [
      "Diljit Dosanjh - G.O.A.T", "Badshah - Genda Phool", "Guru Randhawa - Lahore", "Honey Singh - Blue Eyes",
      "Diljit Dosanjh - Do You Know", "Badshah - DJ Waley Babu", "Guru Randhawa - High Rated Gabru"
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
      "Taylor Swift - Lover", "Ed Sheeran - Thinking Out Loud", "Billie Eilish - Ocean Eyes", "Benson Boone - Beautiful Things",
      "Benson Boone - In The Stars", "Benson Boone - GHOST TOWN", "Miley Cyrus - Flowers", "SZA - Good Days",
      "Lizzo - About Damn Time", "Glass Animals - Heat Waves", "Tate McRae - Greedy", "Sabrina Carpenter - Espresso",
      "Chappell Roan - Good Luck, Babe!", "Gracie Abrams - That's So True", "Teddy Swims - Lose Control",
      "Noah Kahan - Stick Season", "Joji - Glimpse of Us", "Steve Lacy - Bad Habit", "Charlie Puth - Left and Right",
      "Lana Del Rey - Summertime Sadness", "Adele - Easy On Me", "Sam Smith - Unholy", "Lewis Capaldi - Someone You Loved"
    ],
    rock: [
      "Imagine Dragons - Believer", "Coldplay - Viva La Vida", "OneRepublic - Counting Stars", "Maroon 5 - Sugar",
      "Linkin Park - In the End", "Coldplay - Fix You", "Imagine Dragons - Radioactive", "OneRepublic - Apologize",
      "Maroon 5 - Payphone", "Linkin Park - Numb", "Coldplay - The Scientist", "Imagine Dragons - Thunder",
      "Foo Fighters - Everlong", "Red Hot Chili Peppers - Under The Bridge", "The Killers - Mr. Brightside",
      "Arctic Monkeys - Do I Wanna Know?", "Muse - Uprising", "Green Day - Boulevard of Broken Dreams",
      "Paramore - Still Into You", "Fall Out Boy - Sugar, We're Goin Down", "My Chemical Romance - Welcome to the Black Parade"
    ],
    'hip-hop': [
      "Drake - God's Plan", "Kendrick Lamar - HUMBLE.", "Eminem - Lose Yourself", "Post Malone - White Iverson",
      "Travis Scott - SICKO MODE", "Drake - In My Feelings", "Kendrick Lamar - DNA.", "Eminem - Without Me",
      "J. Cole - No Role Modelz", "Future - Mask Off", "Lil Wayne - A Milli", "Jay-Z - 99 Problems",
      "Nas - N.Y. State of Mind", "Childish Gambino - This Is America", "Tyler, The Creator - EARFQUAKE",
      "Mac Miller - Good News", "XXXTentacion - SAD!", "Juice WRLD - Lucid Dreams"
    ],
    'rnb': [
      "John Legend - All of Me", "Beyoncé - Crazy in Love", "Alicia Keys - Fallin'", "Usher - Yeah!",
      "Chris Brown - Forever", "John Legend - Ordinary People", "Beyoncé - Halo", "Alicia Keys - If I Ain't Got You",
      "Frank Ocean - Thinking Bout You", "SZA - Kill Bill", "Daniel Caesar - Best Part", "H.E.R. - Focus",
      "The Weeknd - Earned It", "Khalid - Location", "Summer Walker - Girls Need Love", "Giveon - Heartbreak Anniversary"
    ],
    indie: [
      "Arctic Monkeys - 505", "Tame Impala - The Less I Know The Better", "Foster the People - Pumped Up Kicks",
      "MGMT - Electric Feel", "Alt-J - Left Hand Free", "Glass Animals - Gooey", "The Strokes - Last Nite",
      "Vampire Weekend - A-Punk", "Phoenix - 1901", "Two Door Cinema Club - What You Know",
      "Cage the Elephant - Come a Little Closer", "Portugal. The Man - Feel It Still"
    ],
    electronic: [
      "Calvin Harris - Feel So Close", "David Guetta - Titanium", "Avicii - Wake Me Up", "Skrillex - Bangarang",
      "Deadmau5 - Ghosts 'n' Stuff", "Tiësto - Adagio for Strings", "Martin Garrix - Animals", "Diplo - Revolution",
      "Flume - Never Be Like You", "ODESZA - Say My Name", "Disclosure - Latch", "Justice - D.A.N.C.E."
    ]
  },
  spanish: {
    pop: [
      "Bad Bunny - Tití Me Preguntó", "Rosalía - Con Altura", "J Balvin - Mi Gente", "Maluma - Felices los 4",
      "Ozuna - Baila Baila Baila", "Karol G - Tusa", "Sebastian Yatra - Traicionera", "Camila Cabello - Havana",
      "Shakira - Hips Don't Lie", "Jesse & Joy - Corre!", "Pablo Alborán - Solamente Tú", "Manu Chao - Me Gustas Tú"
    ],
    reggaeton: [
      "Daddy Yankee - Gasolina", "Luis Fonsi - Despacito", "Bad Bunny - Yo Perreo Sola", "J Balvin - Ginza",
      "Maluma - Corazón", "Ozuna - Te Boté", "Karol G - Bichota", "Anuel AA - Ella Quiere Beber",
      "Nicky Jam - El Perdón", "Wisin & Yandel - Rakata", "Don Omar - Danza Kuduro", "Farruko - Pepas"
    ]
  },
  korean: {
    kpop: [
      "BTS - Dynamite", "BLACKPINK - DDU-DU DDU-DU", "NewJeans - Super Shy", "IVE - LOVE DIVE",
      "TWICE - The Feels", "Stray Kids - God's Menu", "ITZY - WANNABE", "aespa - Next Level",
      "BTS - Butter", "BLACKPINK - Kill This Love", "NewJeans - Attention", "IVE - Eleven",
      "Red Velvet - Psycho", "SEVENTEEN - God of Music", "NCT Dream - Hot Sauce", "(G)I-DLE - Tomboy",
      "LE SSERAFIM - ANTIFRAGILE", "Girls' Generation - Gee", "Big Bang - Fantastic Baby", "EXO - Love Shot"
    ]
  },
  japanese: {
    jpop: [
      "Kenshi Yonezu - Lemon", "Official HIGE DANdism - Pretender", "Aimyon - Marigold", "YOASOBI - Yoru ni Kakeru",
      "King Gnu - Hakujitsu", "LiSA - Gurenge", "Fujii Kaze - Shinunoga E-Wa", "Eve - Kaikai Kitan",
      "RADWIMPS - Zen Zen Zense", "ONE OK ROCK - The Beginning", "Hikaru Utada - First Love", "Ayumi Hamasaki - M"
    ]
  },
  french: {
    pop: [
      "Stromae - Alors on Danse", "Christine and the Queens - Tilted", "Angèle - Balance ton quoi",
      "Indila - Dernière Danse", "Tal - Le Sens de la Vie", "Zaz - Je veux", "Louane - Avenir",
      "Dadju - Reine", "Soprano - Cosmo", "Bigflo & Oli - Dommage"
    ]
  }
};

// Smart playlist generation function with intelligent language handling
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
  
  // Shuffle function for better randomization
  const shuffleArray = (array: string[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Smart language selection - don't force languages that don't match user preference
  const primaryLanguage = Object.keys(analysis.languages).reduce((a, b) => 
    analysis.languages[a] > analysis.languages[b] ? a : b, 'english'
  );
  
  const shouldIncludeOtherLanguages = Object.keys(analysis.languages).length > 1;
  
  console.log(`Primary language: ${primaryLanguage}, Include others: ${shouldIncludeOtherLanguages}`);
  
  // Generate playlists with category-specific logic
  const categories = ['Mix', 'Focus', 'Motivation', 'Emotional', 'Workout'];
  const playlists = categories.map((category, categoryIndex) => {
    const songs: string[] = [];
    const usedSongs = new Set<string>();
    const targetCount = 25;
    
    // Category-specific genre preferences
    const categoryGenrePrefs = {
      'Mix': ['pop', 'rock', 'rnb', 'indie'],
      'Focus': ['indie', 'electronic', 'pop', 'rnb'], 
      'Motivation': ['rock', 'hip-hop', 'pop', 'electronic'],
      'Emotional': ['rnb', 'pop', 'indie', 'rock'],
      'Workout': ['hip-hop', 'electronic', 'rock', 'pop']
    };
    
    const preferredGenres = categoryGenrePrefs[category] || ['pop', 'rock'];
    
    // Start with primary language (70-80% of songs)
    const primarySongCount = Math.floor(targetCount * 0.75);
    let addedFromPrimary = 0;
    
    for (const genre of preferredGenres) {
      if (addedFromPrimary >= primarySongCount) break;
      
      const genreSongs = songDatabase[primaryLanguage]?.[genre] || [];
      if (genreSongs.length > 0) {
        const shuffledSongs = shuffleArray(genreSongs);
        const songsToAdd = Math.min(8, Math.floor(primarySongCount / preferredGenres.length));
        
        for (let i = 0; i < songsToAdd && addedFromPrimary < primarySongCount; i++) {
          const song = shuffledSongs[i];
          if (song && !usedSongs.has(song)) {
            songs.push(song);
            usedSongs.add(song);
            addedFromPrimary++;
          }
        }
      }
    }
    
    // Add some variety from other languages only if user showed interest
    if (shouldIncludeOtherLanguages && songs.length < targetCount) {
      const otherLanguages = Object.keys(songDatabase).filter(lang => lang !== primaryLanguage);
      const remainingSlots = targetCount - songs.length;
      let addedFromOthers = 0;
      
      for (const lang of shuffleArray(otherLanguages)) {
        if (addedFromOthers >= remainingSlots) break;
        
        const availableGenres = Object.keys(songDatabase[lang] || {});
        for (const genre of shuffleArray(availableGenres)) {
          const genreSongs = songDatabase[lang]?.[genre] || [];
          if (genreSongs.length > 0) {
            const shuffledSongs = shuffleArray(genreSongs);
            const songsToAdd = Math.min(3, remainingSlots - addedFromOthers);
            
            for (let i = 0; i < songsToAdd && addedFromOthers < remainingSlots; i++) {
              const song = shuffledSongs[i];
              if (song && !usedSongs.has(song)) {
                songs.push(song);
                usedSongs.add(song);
                addedFromOthers++;
              }
            }
          }
          if (addedFromOthers >= remainingSlots) break;
        }
      }
    }
    
    // Fill remaining slots with more primary language songs if needed
    while (songs.length < targetCount) {
      let added = false;
      for (const genre of Object.keys(songDatabase[primaryLanguage] || {})) {
        const genreSongs = songDatabase[primaryLanguage]?.[genre] || [];
        const shuffledSongs = shuffleArray(genreSongs);
        
        for (const song of shuffledSongs) {
          if (!usedSongs.has(song) && songs.length < targetCount) {
            songs.push(song);
            usedSongs.add(song);
            added = true;
            break;
          }
        }
        if (added) break;
      }
      if (!added) break; // Prevent infinite loop
    }
    
    console.log(`Generated ${category} playlist with ${songs.length} songs`);
    return { 
      category, 
      songs: shuffleArray(songs.slice(0, targetCount)),
      generatedAt: new Date().toISOString(),
      id: `${category.toLowerCase()}-${generationId}-${categoryIndex}`
    };
  });
  
  console.log('Playlists generated successfully with smart language handling');
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