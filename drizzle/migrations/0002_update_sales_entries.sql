-- Update sales_entries table: remove commissionAmount, add effectiveDate
ALTER TABLE sales_entries DROP COLUMN IF EXISTS commissionAmount;
ALTER TABLE sales_entries ADD COLUMN effectiveDate BIGINT AFTER commissionOverride;
