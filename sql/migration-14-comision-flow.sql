-- ============================================
-- NorthPeak Digital — Migration 14: Flujo de Comisión en Cliente
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- 1. Agregar columnas a clients para vincular socio y comision
ALTER TABLE clients ADD COLUMN IF NOT EXISTS socio_id uuid REFERENCES socios(id) ON DELETE SET NULL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS comision_id uuid REFERENCES comisiones(id) ON DELETE SET NULL;

-- 2. Tabla de tareas del flujo de comisión (similar a client_tasks)
CREATE TABLE IF NOT EXISTS comision_tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  done_at timestamptz,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE comision_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to comision_tasks" ON comision_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_comision_tasks_client ON comision_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_socio ON clients(socio_id);
