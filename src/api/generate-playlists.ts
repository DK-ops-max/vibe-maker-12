// This would be an edge function in a real Supabase setup
// For now, we'll create a mock implementation

import { GeneratedPlaylist } from "@/types/music";

export const generatePlaylistsAPI = async (likedSongs: string[]): Promise<GeneratedPlaylist[]> => {
  // Mock OpenAI API call
  const prompt = `Based on these liked songs: ${likedSongs.join(', ')}, 
  generate 5 playlists with 25+ songs each for these categories:
  - Mix: A diverse mix based on the user's taste
  - Focus: Concentration and work music
  - Motivation: Upbeat and inspiring tracks
  - Emotional: Deep, meaningful, and emotional songs
  - Workout: High-energy exercise music
  
  Return songs in "Artist - Song Name" format.`;

  // Mock response - in production, this would call OpenAI API
  const mockPlaylists: GeneratedPlaylist[] = [
    {
      category: 'Mix',
      songs: [
        'The Weeknd - Blinding Lights',
        'Dua Lipa - Physical',
        'Post Malone - Circles',
        'Billie Eilish - bad guy',
        'Ariana Grande - positions',
        'Drake - God\'s Plan',
        'Taylor Swift - Anti-Hero',
        'Harry Styles - As It Was',
        'Bad Bunny - Me Porto Bonito',
        'Olivia Rodrigo - good 4 u',
        'Lil Nas X - MONTERO',
        'Doja Cat - Woman',
        'The Kid LAROI - STAY',
        'Bruno Mars - Leave The Door Open',
        'SZA - Good Days',
        'Kendrick Lamar - HUMBLE.',
        'Adele - Easy On Me',
        'Ed Sheeran - Shape of You',
        'Lizzo - About Damn Time',
        'Glass Animals - Heat Waves',
        'Lorde - Solar Power',
        'Silk Sonic - Smokin Out The Window',
        'Megan Thee Stallion - Savage',
        'Future - Life Is Good',
        'Cardi B - WAP'
      ]
    },
    {
      category: 'Focus',
      songs: [
        'Ludovico Einaudi - Nuvole Bianche',
        'Max Richter - On The Nature of Daylight',
        'Ólafur Arnalds - Near Light',
        'Nils Frahm - Says',
        'GoGo Penguin - Hopopono',
        'Kiasmos - Blurred EP',
        'Emancipator - Soon It Will Be Cold Enough',
        'Bonobo - Kong',
        'Tycho - A Walk',
        'Boards of Canada - Roygbiv',
        'Brian Eno - Music for Airports',
        'Stars of the Lid - The Tired Sounds of Stars',
        'Tim Hecker - Ravedeath',
        'Hammock - Turn Away and Return',
        'Helios - Halving the Compass',
        'Goldfrapp - Utopia',
        'Burial - Untrue',
        'Aphex Twin - Xtal',
        'Slowdive - Sugar for the Pill',
        'My Bloody Valentine - Only Shallow',
        'Sigur Rós - Hoppípolla',
        'Godspeed You! Black Emperor - Storm',
        'A Winged Victory for the Sullen - We Played Some Open Chords',
        'Eluvium - Static Song',
        'Fennesz - Endless Summer'
      ]
    },
    {
      category: 'Motivation',
      songs: [
        'Eye of the Tiger - Survivor',
        'Stronger - Kanye West',
        'Till I Collapse - Eminem',
        'Can\'t Hold Us - Macklemore',
        'Thunder - Imagine Dragons',
        'Believer - Imagine Dragons',
        'High Hopes - Panic! At The Disco',
        'Good as Hell - Lizzo',
        'Confident - Demi Lovato',
        'Roar - Katy Perry',
        'Stronger (What Doesn\'t Kill You) - Kelly Clarkson',
        'Fight Song - Rachel Platten',
        'Titanium - David Guetta ft. Sia',
        'Unstoppable - Sia',
        'Champion - Carrie Underwood',
        'Whatever It Takes - Imagine Dragons',
        'On Top of the World - Imagine Dragons',
        'Hall of Fame - The Script',
        'Rise Up - Andra Day',
        'Confident - Justin Bieber',
        'Unwritten - Natasha Bedingfield',
        'Born This Way - Lady Gaga',
        'Firework - Katy Perry',
        'Shake It Off - Taylor Swift',
        'Can\'t Stop the Feeling! - Justin Timberlake'
      ]
    },
    {
      category: 'Emotional',
      songs: [
        'Someone Like You - Adele',
        'Hurt - Johnny Cash',
        'Mad World - Gary Jules',
        'The Sound of Silence - Disturbed',
        'Hallelujah - Jeff Buckley',
        'Black - Pearl Jam',
        'Tears in Heaven - Eric Clapton',
        'Everybody Hurts - R.E.M.',
        'Skinny Love - Bon Iver',
        'Heavy - Linkin Park ft. Kiiara',
        'Say Something - A Great Big World',
        'All of Me - John Legend',
        'Someone You Loved - Lewis Capaldi',
        'Fix You - Coldplay',
        'The Night We Met - Lord Huron',
        'Breathe Me - Sia',
        'Mad About You - Sting',
        'Creep - Radiohead',
        'Hurt - Nine Inch Nails',
        'Losing You - Randy Newman',
        'The Scientist - Coldplay',
        'Iris - Goo Goo Dolls',
        'Everybody\'s Gotta Learn Sometime - Beck',
        'Falling - Harry Styles',
        'Drivers License - Olivia Rodrigo'
      ]
    },
    {
      category: 'Workout',
      songs: [
        'Pump It - Black Eyed Peas',
        'Stronger - Kanye West',
        'Till I Collapse - Eminem',
        'Power - Kanye West',
        'HUMBLE. - Kendrick Lamar',
        'All the Way Up - Fat Joe',
        'Can\'t Hold Us - Macklemore',
        'Thunder - Imagine Dragons',
        'Believer - Imagine Dragons',
        'Uptown Funk - Mark Ronson ft. Bruno Mars',
        'Sorry - Justin Bieber',
        'Shape of You - Ed Sheeran',
        'Blinding Lights - The Weeknd',
        'Physical - Dua Lipa',
        'Don\'t Start Now - Dua Lipa',
        'Levitating - Dua Lipa',
        'Industry Baby - Lil Nas X',
        'STAY - The Kid LAROI',
        'Heat Waves - Glass Animals',
        'Good 4 U - Olivia Rodrigo',
        'Peaches - Justin Bieber',
        'Save Your Tears - The Weeknd',
        'Positions - Ariana Grande',
        'Watermelon Sugar - Harry Styles',
        'Savage - Megan Thee Stallion'
      ]
    }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return mockPlaylists;
};