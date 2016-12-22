CREATE TABLE public.config (
	dh_prime BYTEA DEFAULT NULL
);

CREATE TABLE public.users (
    id SERIAL PRIMARY KEY NOT NULL,
    username TEXT NOT NULL,
    password JSON NOT NULL,
    public_key BYTEA NOT NULL
);

CREATE TABLE public.sessions (
    token TEXT PRIMARY KEY NOT NULL,
    ip TEXT NOT NULL,
    userid INTEGER NOT NULL,
    time INTEGER NOT NULL,
    CONSTRAINT sessions_users_id_fk FOREIGN KEY (userid) REFERENCES users (id)
);

CREATE TABLE public.messages
(
    id SERIAL PRIMARY KEY,
    "from" INT NOT NULL,
    "to" INT NOT NULL,
    content TEXT
);