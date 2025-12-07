-- Create comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  user_id INTEGER,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  content TEXT NOT NULL,
  mentions TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_comments_message_id ON comments(message_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on comments" ON comments FOR ALL USING (true);

-- Grant permissions to authenticated and anon users (adjust as needed)
GRANT ALL ON comments TO anon, authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE comments_id_seq TO anon, authenticated, service_role;
