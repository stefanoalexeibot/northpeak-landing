-- ============================================
-- NorthPeak Digital — Portal de Clientes
-- Supabase Schema (safe to re-run)
-- ============================================
-- Copia y pega TODO este archivo en el SQL Editor de Supabase

-- ========== LIMPIAR TODO PRIMERO ==========
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP POLICY IF EXISTS "Clients can read own messages" ON messages;
DROP POLICY IF EXISTS "Clients can insert messages" ON messages;
DROP POLICY IF EXISTS "Admin full access to messages" ON messages;
DROP TABLE IF EXISTS messages CASCADE;

DROP POLICY IF EXISTS "Clients can read own referrals" ON referrals;
DROP POLICY IF EXISTS "Clients can insert referrals" ON referrals;
DROP POLICY IF EXISTS "Admin full access to referrals" ON referrals;
DROP TABLE IF EXISTS referrals CASCADE;

DROP POLICY IF EXISTS "Clients can read own media" ON media;
DROP POLICY IF EXISTS "Admin full access to media" ON media;
DROP TABLE IF EXISTS media CASCADE;

DROP POLICY IF EXISTS "Clients can read own deliverables" ON deliverables;
DROP POLICY IF EXISTS "Admin full access to deliverables" ON deliverables;
DROP TABLE IF EXISTS deliverables CASCADE;

DROP POLICY IF EXISTS "Clients can read own projects" ON projects;
DROP POLICY IF EXISTS "Admin full access to projects" ON projects;
DROP TABLE IF EXISTS projects CASCADE;

DROP POLICY IF EXISTS "Clients can read own documents" ON documents;
DROP POLICY IF EXISTS "Admin full access to documents" ON documents;
DROP TABLE IF EXISTS documents CASCADE;

DROP POLICY IF EXISTS "Clients can read own data" ON clients;
DROP POLICY IF EXISTS "Admin full access to clients" ON clients;
DROP TABLE IF EXISTS clients CASCADE;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON profiles;
DROP TABLE IF EXISTS profiles CASCADE;

-- Limpiar storage policies
DROP POLICY IF EXISTS "Admin can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read own files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete files" ON storage.objects;


-- ========== CREAR TABLAS ==========

-- Profiles (linked to auth.users)
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin can update profiles" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Clients
CREATE TABLE clients (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL DEFAULT '',
  phone text,
  photo_url text,
  cover_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can read own data" ON clients FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admin full access to clients" ON clients FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Documents
CREATE TABLE documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('contract', 'welcome', 'invoice')),
  title text NOT NULL,
  file_url text,
  content jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can read own documents" ON documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = documents.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Admin full access to documents" ON documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Projects
CREATE TABLE projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'review', 'completed', 'paused')),
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can read own projects" ON projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = projects.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Admin full access to projects" ON projects FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Deliverables
CREATE TABLE deliverables (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed')),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can read own deliverables" ON deliverables FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects
    JOIN clients ON clients.id = projects.client_id
    WHERE projects.id = deliverables.project_id AND clients.user_id = auth.uid()
  )
);
CREATE POLICY "Admin full access to deliverables" ON deliverables FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Media (files/entregables)
CREATE TABLE media (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL DEFAULT '',
  file_size bigint NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can read own media" ON media FOR SELECT USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = media.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Admin full access to media" ON media FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Referrals
CREATE TABLE referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  referred_name text NOT NULL,
  referred_email text NOT NULL,
  referred_phone text,
  referred_company text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can read own referrals" ON referrals FOR SELECT USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = referrals.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Clients can insert referrals" ON referrals FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = referrals.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Admin full access to referrals" ON referrals FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Messages
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES auth.users(id) NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('admin', 'client')),
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can read own messages" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = messages.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Clients can insert messages" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = messages.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Admin full access to messages" ON messages FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);


-- ========== TRIGGER: auto-crear profile al registrarse ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'client');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ========== STORAGE ==========
INSERT INTO storage.buckets (id, name, public) VALUES ('client-files', 'client-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Admin can upload files" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'client-files' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Authenticated users can read own files" ON storage.objects FOR SELECT
  USING (bucket_id = 'client-files' AND auth.role() = 'authenticated');

CREATE POLICY "Admin can delete files" ON storage.objects FOR DELETE
  USING (bucket_id = 'client-files' AND EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));


-- ========== HACER ADMIN a goldiggerofficial@gmail.com ==========
-- Esto crea el profile si no existe y lo pone como admin
INSERT INTO profiles (id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'goldiggerofficial@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
