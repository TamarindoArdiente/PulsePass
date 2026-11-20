-- Frontend (Fase 5): los roles de la aplicación son USER, STAFF y ADMIN.
-- V4 definió ORGANIZER; se migra a STAFF sin tocar V4 (Flyway valida su checksum).
ALTER TABLE users
    DROP CONSTRAINT chk_users_role;

UPDATE users
SET role = 'STAFF'
WHERE role = 'ORGANIZER';

ALTER TABLE users
    ADD CONSTRAINT chk_users_role CHECK (role IN ('USER', 'STAFF', 'ADMIN'));
