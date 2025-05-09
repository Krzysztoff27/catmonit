\c catmonit_base;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(32) NOT NULL,
    password_hash BYTEA NOT NULL,
    salt BYTEA NOT NULL
);

CREATE TABLE IF NOT EXISTS dashboard_layouts (
    layout_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    layout_name TEXT,
    layout_body JSON
);

CREATE TABLE users_devices (
    user_id INTEGER,
    device_id INTEGER
);