-- ============================================
-- NorthPeak Digital — Migration 13: Portal Comisionista
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- 1. Permitir role 'comisionista' en profiles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'client', 'comisionista'));

-- 2. Tabla: prospectos (leads generados por el comisionista para sus socios)
CREATE TABLE IF NOT EXISTS prospectos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  socio_id uuid REFERENCES socios(id) ON DELETE CASCADE NOT NULL,
  nombre text NOT NULL,
  telefono text,
  email text,
  descripcion text,
  etapa text NOT NULL DEFAULT 'nuevo'
    CHECK (etapa IN ('nuevo', 'contactado', 'interesado', 'negociacion', 'ganado', 'perdido')),
  monto_potencial decimal(12,2),
  fuente text,
  notas text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE prospectos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comisionista and admin access prospectos" ON prospectos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('comisionista', 'admin'))
);

-- 3. Agregar prospecto_id a comisiones (opcional, para ligar comision a prospecto)
ALTER TABLE comisiones ADD COLUMN IF NOT EXISTS prospecto_id uuid REFERENCES prospectos(id) ON DELETE SET NULL;

-- 4. Indices
CREATE INDEX IF NOT EXISTS idx_prospectos_socio ON prospectos(socio_id);
CREATE INDEX IF NOT EXISTS idx_prospectos_etapa ON prospectos(etapa);
CREATE INDEX IF NOT EXISTS idx_prospectos_created ON prospectos(created_at DESC);

-- 5. Actualizar políticas de socios y comisiones para permitir comisionistas
DROP POLICY IF EXISTS "Admin full access to Socios" ON socios;
DROP POLICY IF EXISTS "Admin and Comisionista full access to socios" ON socios;
CREATE POLICY "Admin and Comisionista full access to socios" ON socios FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'comisionista'))
);

DROP POLICY IF EXISTS "Admin full access to comisiones" ON comisiones;
DROP POLICY IF EXISTS "Admin and Comisionista full access to comisiones" ON comisiones;
CREATE POLICY "Admin and Comisionista full access to comisiones" ON comisiones FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'comisionista'))
);

