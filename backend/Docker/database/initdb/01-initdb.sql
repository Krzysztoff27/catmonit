BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'catmonit_base') THEN
        CREATE DATABASE catmonit_base;
    END IF;
END $$;

\c catmonit_base;

DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'catmonit_worker') THEN
        CREATE USER catmonit_worker WITH PASSWORD 'password'; 
    END IF;
    
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username character varying(32) NOT NULL,
        password_hash bytea NOT NULL,
        salt bytea NOT NULL
    );

    CREATE TABLE IF NOT EXISTS dashboard_layouts (
        layout_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        layout_name TEXT NOT NULL,
        layout_body JSON NOT NULL,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS devices (
        device_id UUID PRIMARY KEY,
        last_seen TIMESTAMP NOT NULL,
        hostname VARCHAR(255),
        ip_adress VARCHAR(15),
        network_mask SMALLINT,
        os VARCHAR(100)
    );
    GRANT ALL PRIVILEGES ON DATABASE catmonit_base TO catmonit_worker;
    
    RAISE NOTICE 'catmonit_base initialization completed.';
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'catmonit_base initialization failed: %', SQLERRM;
        ROLLBACK;
END $$;

COMMIT;