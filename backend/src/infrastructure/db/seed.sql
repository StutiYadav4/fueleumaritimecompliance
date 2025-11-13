-- seed.sql
-- Insert sample KPI dataset routes (won't duplicate because of ON CONFLICT)
INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption_t, distance_km, total_emissions_t, is_baseline)
VALUES
('R001','Container','HFO',2024,91.0,5000,12000,4500,false),
('R002','BulkCarrier','LNG',2024,88.0,4800,11500,4200,true),
('R003','Tanker','MGO',2024,93.5,5100,12500,4700,false),
('R004','RoRo','HFO',2025,89.2,4900,11800,4300,false),
('R005','Container','LNG',2025,90.5,4950,11900,4400,false)
ON CONFLICT (route_id) DO NOTHING;

-- (Optional) seed a bank entry example
INSERT INTO bank_entries (ship_id, year, amount_t)
VALUES ('R002', 2024, 50.0)
ON CONFLICT DO NOTHING;
