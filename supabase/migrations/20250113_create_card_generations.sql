/*
# Video Card Generator Database Schema
Creates tables to store video card generation history and configurations.

## Query Description: 
This migration creates the core database structure for storing video card generations. 
It creates a public table to store user inputs and generated outputs without requiring authentication.
The schema supports storing multiple video links, titles, and descriptions per generation.
This is a safe structural change that creates new functionality without affecting existing data.

## Metadata:
- Schema-Category: "Safe"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Creates: public.card_generations table
- Columns: id, video_type, image_type, video_links, image_links, titles, descriptions, generated_html, created_at
- Constraints: NOT NULL on required fields, CHECK constraints for valid enum values

## Security Implications:
- RLS Status: Enabled
- Policy Changes: Yes - allows public read/write access
- Auth Requirements: None - public access enabled

## Performance Impact:
- Indexes: Primary key index on id, index on created_at for chronological queries
- Triggers: None
- Estimated Impact: Minimal - single table creation with basic indexes
*/

-- Create the card_generations table to store video card conversion data
CREATE TABLE public.card_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_type TEXT NOT NULL CHECK (video_type IN ('googledrive', 'youtube')),
    image_type TEXT NOT NULL CHECK (image_type IN ('googledrive', 'google', 'youtube')),
    video_links JSONB NOT NULL,
    image_links JSONB,
    titles JSONB NOT NULL,
    descriptions JSONB NOT NULL,
    generated_html TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_card_generations_created_at ON public.card_generations(created_at DESC);
CREATE INDEX idx_card_generations_video_type ON public.card_generations(video_type);

-- Enable Row Level Security
ALTER TABLE public.card_generations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public read access" ON public.card_generations
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON public.card_generations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON public.card_generations
    FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON public.card_generations
    FOR DELETE USING (true);

-- Grant necessary permissions
GRANT ALL ON public.card_generations TO anon;
GRANT ALL ON public.card_generations TO authenticated;
