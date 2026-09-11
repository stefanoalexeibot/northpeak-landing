-- ============================================
-- NorthPeak Digital — Migration 12: Socios
-- Módulo completo de gestión de Socios
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- ========== TABLA: Socios ==========
CREATE TABLE IF NOT EXISTS Socios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users ON DELETE SET NULL UNIQUE,
  nombre text NOT NULL,
  email text NOT NULL,
  telefono text,
  porcentaje_comision decimal(5,2) NOT NULL DEFAULT 10.00 CHECK (porcentaje_comision >= 0 AND porcentaje_comision <= 100),
  activo boolean NOT NULL DEFAULT true,
  notas text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE Socios ENABLE ROW LEVEL SECURITY;

-- Admin puede hacer todo
CREATE POLICY "Admin full access to Socios" ON Socios FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Socio puede ver su propio registro
CREATE POLICY "Socio can read own record" ON Socios FOR SELECT USING (
  user_id = auth.uid()
);

-- ========== TABLA: comisiones ==========
CREATE TABLE IF NOT EXISTS comisiones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  Socio_id uuid REFERENCES Socios(id) ON DELETE CASCADE NOT NULL,
  analisis_id uuid REFERENCES analisis_digital(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  nombre_negocio text NOT NULL,
  monto_venta decimal(12,2) NOT NULL,
  porcentaje_aplicado decimal(5,2) NOT NULL,
  monto_comision decimal(12,2) NOT NULL,
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'pagada', 'cancelada')),
  paid_at timestamptz,
  notas text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comisiones ENABLE ROW LEVEL SECURITY;

-- Admin puede hacer todo
CREATE POLICY "Admin full access to comisiones" ON comisiones FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Socio puede ver sus propias comisiones
CREATE POLICY "Socio can read own comisiones" ON comisiones FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM Socios
    WHERE Socios.id = comisiones.Socio_id
    AND Socios.user_id = auth.uid()
  )
);

-- ========== AGREGAR Socio_id a analisis_digital ==========
ALTER TABLE analisis_digital ADD COLUMN IF NOT EXISTS Socio_id uuid REFERENCES Socios(id) ON DELETE SET NULL;

-- ========== PERFIL de Socio: actualizar role check ==========
-- NOTA: Si tu tabla profiles tiene un CHECK constraint en role, actualízalo:
-- ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
-- ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
--   CHECK (role IN ('admin', 'client', 'Socio'));

-- ========== ÍNDICES ==========
CREATE INDEX IF NOT EXISTS idx_comisiones_Socio ON comisiones(Socio_id);
CREATE INDEX IF NOT EXISTS idx_comisiones_status ON comisiones(status);
CREATE INDEX IF NOT EXISTS idx_analisis_Socio ON analisis_digital(Socio_id);
CREATE INDEX IF NOT EXISTS idx_Socios_email ON Socios(email);
