-- 002_add_mfa_fields.sql
-- Agrega soporte de autenticación multifactor (TOTP) a la tabla usuarios

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS mfa_backup_codes JSON;
