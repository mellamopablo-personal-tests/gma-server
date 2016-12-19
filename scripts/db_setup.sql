CREATE TABLE public.users (
    id SERIAL PRIMARY KEY NOT NULL,
    username TEXT NOT NULL,
    password JSON NOT NULL
);

CREATE TABLE sessions (
    token TEXT PRIMARY KEY NOT NULL,
    time INTEGER NOT NULL,
    userid INTEGER NOT NULL,
    CONSTRAINT sessions_users_id_fk FOREIGN KEY (userid) REFERENCES users (id)
);