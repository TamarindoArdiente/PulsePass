-- Fase 4: credenciales y rol para Spring Security.
-- password: hash BCrypt (60 caracteres). Nullable para no romper usuarios previos a esta fase;
-- un usuario sin password no puede autenticarse.
ALTER TABLE users
    ADD COLUMN password VARCHAR(100);

ALTER TABLE users
    ADD COLUMN role VARCHAR(30) NOT NULL DEFAULT 'USER';

ALTER TABLE users
    ADD CONSTRAINT chk_users_role CHECK (role IN ('USER', 'ORGANIZER', 'ADMIN'));
