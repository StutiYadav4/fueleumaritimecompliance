-- init.sql
-- Create tables used by the backend
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  route_id TEXT UNIQUE NOT NULL,
  vessel_type TEXT,
  fuel_type TEXT,
  year INTEGER,
  ghg_intensity NUMERIC,
  fuel_consumption_t NUMERIC,
  distance_km NUMERIC,
  total_emissions_t NUMERIC,
  is_baseline BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS ship_compliance (
  id SERIAL PRIMARY KEY,
  ship_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  cb_gco2eq NUMERIC, -- gCO2e
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_entries (
  id SERIAL PRIMARY KEY,
  ship_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  amount_t NUMERIC NOT NULL, -- tonnes CO2e (banked)
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pools (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pool_members (
  id SERIAL PRIMARY KEY,
  pool_id INTEGER REFERENCES pools(id) ON DELETE CASCADE,
  ship_id TEXT NOT NULL,
  cb_before NUMERIC NOT NULL,
  cb_after NUMERIC NOT NULL
);

