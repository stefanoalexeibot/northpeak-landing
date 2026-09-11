-- ============================================
-- NorthPeak Digital — Seed: Hacer admin
-- ============================================
-- Ejecuta esto en el SQL Editor de Supabase
-- después de crear tu usuario en Authentication > Users
--
-- INSTRUCCIONES:
-- 1. Ve a Authentication > Users > Add User
-- 2. Crea tu usuario con email y contraseña
-- 3. Copia tu email abajo y ejecuta este script
-- ============================================

-- >>> CAMBIA ESTE EMAIL POR EL TUYO <<<
DO $$
DECLARE
  admin_email TEXT := 'goldiggerofficial@gmail.com';
  admin_id UUID;
BEGIN
  -- Buscar el usuario
  SELECT id INTO admin_id FROM auth.users WHERE email = admin_email;

  IF admin_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró usuario con email: %', admin_email;
  END IF;

  -- Actualizar role a admin
  UPDATE profiles SET role = 'admin' WHERE id = admin_id;

  RAISE NOTICE 'Usuario % ahora es admin', admin_email;
END $$;
