CREATE TABLE venues(
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT unq_code UNIQUE (code),
    CONSTRAINT chk_capacity_value CHECK (capacity > 0)
);

CREATE TABLE events(
    id BIGSERIAL PRIMARY KEY,
    event_code  VARCHAR(50) NOT NULL,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    category VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    event_date TIMESTAMP NOT NULL,
    minimum_age INTEGER NOT NULL DEFAULT 0,
    venue_id BIGINT NOT NULL,

    CONSTRAINT uk_event_code UNIQUE (event_code),
    CONSTRAINT fk_events_venue FOREIGN KEY (venue_id) REFERENCES venues (id),
    CONSTRAINT chk_events_category CHECK (category IN(
        'MUSIC',
        'SPORTS',
        'TECHNOLOGY',
        'EDUCATION',
        'CULTURE',
        'ENTERTAINMENT'
    )),
    CONSTRAINT chk_event_status CHECK (status IN (
        'DRAFT',
        'PUBLISHED',
        'SOLD_OUT',
        'CANCELLED',
        'FINISHED'
    )),
    CONSTRAINT chk_events_minimum_age CHECK (minimum_age >= 0)
);

CREATE TABLE artists(
    id BIGSERIAL PRIMARY KEY,
    stage_name VARCHAR(150) NOT NULL,
    country VARCHAR(100) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_artists_stage_name UNIQUE (stage_name)
);

CREATE TABLE event_artists (
    event_id   BIGINT NOT NULL,
    artist_id  BIGINT NOT NULL,
    CONSTRAINT pk_event_artists PRIMARY KEY (event_id, artist_id),
    CONSTRAINT fk_event_artists_event
        FOREIGN KEY (event_id) REFERENCES events (id),
    CONSTRAINT fk_event_artists_artist
        FOREIGN KEY (artist_id) REFERENCES artists (id)
);

CREATE TABLE users(
    id BIGSERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL,

    CONSTRAINT uk_users_username UNIQUE (user_name),
    CONSTRAINT uk_users_email UNIQUE (email)
);

CREATE TABLE user_profiles(
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(50),
    birth_date DATE,
    user_id BIGINT NOT NULL,

    CONSTRAINT uk_user_profiles_user_id UNIQUE (user_id),
    CONSTRAINT fk_profile_user_id FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE tickets(
    id BIGSERIAL PRIMARY KEY,
    ticket_code VARCHAR(100) NOT NULL,
    type VARCHAR(30) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL,
    purchase_date TIMESTAMP NOT NULL,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,

    CONSTRAINT uk_ticket_code UNIQUE (ticket_code),
    CONSTRAINT fk_ticket_user_id FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_ticket_event_id FOREIGN KEY (event_id) REFERENCES events (id),
    CONSTRAINT chk_status_ticket CHECK (status IN (
        'USED',
        'PAID',
        'CANCELLED',
        'RESERVED'
    )),
    CONSTRAINT chk_type_ticket CHECK (type IN(
        'GENERAL',
        'VIP',
        'BACKSTAGE',
        'STUDENT'
    )),
    CONSTRAINT chk_ticket_price_not_negative CHECK (price >= 0)
);

--index

CREATE INDEX idx_events_venue_id ON events (venue_id);
CREATE INDEX idx_events_status ON events (status);
CREATE INDEX idx_events_event_date ON events (event_date);

CREATE INDEX idx_tickets_user_id ON tickets (user_id);
CREATE INDEX idx_tickets_event_id ON tickets (event_id);
CREATE INDEX idx_tickets_status ON tickets (status);