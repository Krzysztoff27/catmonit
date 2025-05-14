\c catmonit_base;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username character varying(32) NOT NULL,
    password_hash bytea NOT NULL,
    salt bytea NOT NULL,
    permissions integer
);

CREATE TABLE dashboard_layouts (
    layout_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    layout_name TEXT NOT NULL,
    layout_body JSON NOT NULL,
    user_id UUID NOT NULL
);

CREATE TABLE users_devices (
    user_id UUID NOT NULL,
    device_id UUID NOT NULL
);

CREATE TABLE devices (
    device_id UUID PRIMARY KEY,
    last_seen TIMESTAMP WITHOUT TIME ZONE NOT NULL
);