-- Add phone and portalUrl fields to carriers table
ALTER TABLE carriers ADD COLUMN phone VARCHAR(50) AFTER type;
ALTER TABLE carriers ADD COLUMN portalUrl LONGTEXT AFTER phone;
