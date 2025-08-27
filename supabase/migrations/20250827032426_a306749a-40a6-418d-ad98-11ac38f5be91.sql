-- Create table for saved playlists
CREATE TABLE IF NOT EXISTS public.saved_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  songs JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.saved_playlists ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own playlists" 
ON public.saved_playlists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists" 
ON public.saved_playlists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
ON public.saved_playlists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
ON public.saved_playlists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_saved_playlists_user_id ON public.saved_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_playlists_category ON public.saved_playlists(category);