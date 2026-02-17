-- Feature 1: Email tracking
ALTER TABLE clients ADD COLUMN IF NOT EXISTS welcome_email_sent_at timestamptz DEFAULT NULL;

-- Feature 4: Badges de contenido nuevo
ALTER TABLE documents ADD COLUMN IF NOT EXISTS seen_by_client boolean DEFAULT false;
ALTER TABLE media ADD COLUMN IF NOT EXISTS seen_by_client boolean DEFAULT false;

-- Feature 6: Firma digital
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signed boolean DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signature_data text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS signed_at timestamptz;

-- Feature 7: Pagos
CREATE TABLE IF NOT EXISTS payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10,2) NOT NULL,
  concept text NOT NULL,
  payment_method text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  reference_number text,
  notes text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients read own payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = payments.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Admin full payments" ON payments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Feature 8: Tema claro/oscuro
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme text DEFAULT 'dark';

-- Feature 10: Hitos de proyecto
CREATE TABLE IF NOT EXISTS project_milestones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  due_date date NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients read own milestones" ON project_milestones FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects JOIN clients ON clients.id = projects.client_id
    WHERE projects.id = project_milestones.project_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Admin full milestones" ON project_milestones FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Feature 11: Testimonios
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  content text NOT NULL,
  is_approved boolean DEFAULT false,
  is_published boolean DEFAULT false,
  submitted_at timestamptz DEFAULT now()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients read own testimonials" ON testimonials FOR SELECT USING (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = testimonials.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Clients insert own testimonials" ON testimonials FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM clients WHERE clients.id = testimonials.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Admin full testimonials" ON testimonials FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Public read published" ON testimonials FOR SELECT USING (is_published = true AND is_approved = true);
