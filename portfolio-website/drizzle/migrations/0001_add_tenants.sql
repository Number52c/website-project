-- Create tenants table for multi-tenant support
CREATE TABLE IF NOT EXISTS tenants (
  id VARCHAR(64) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#0D1B3E',
  secondary_color VARCHAR(7) DEFAULT '#D4AF37',
  subscription_status ENUM('active', 'trial', 'suspended', 'cancelled') DEFAULT 'trial',
  subscription_plan ENUM('professional', 'enterprise') DEFAULT 'professional',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  owner_email VARCHAR(320),
  owner_name VARCHAR(255),
  INDEX idx_domain (domain)
);

-- Add tenant_id to users table
ALTER TABLE users ADD COLUMN tenant_id VARCHAR(64) DEFAULT 'default-tenant' AFTER id;
ALTER TABLE users ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE users ADD INDEX idx_tenant_id (tenant_id);

-- Add tenant_id to quote_requests table
ALTER TABLE quote_requests ADD COLUMN tenant_id VARCHAR(64) DEFAULT 'default-tenant' AFTER id;
ALTER TABLE quote_requests ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE quote_requests ADD INDEX idx_tenant_id (tenant_id);

-- Add tenant_id to contact_submissions table
ALTER TABLE contact_submissions ADD COLUMN tenant_id VARCHAR(64) DEFAULT 'default-tenant' AFTER id;
ALTER TABLE contact_submissions ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE contact_submissions ADD INDEX idx_tenant_id (tenant_id);

-- Add tenant_id to clients table
ALTER TABLE clients ADD COLUMN tenant_id VARCHAR(64) DEFAULT 'default-tenant' AFTER id;
ALTER TABLE clients ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE clients ADD INDEX idx_tenant_id (tenant_id);

-- Add tenant_id to policies table
ALTER TABLE policies ADD COLUMN tenant_id VARCHAR(64) DEFAULT 'default-tenant' AFTER id;
ALTER TABLE policies ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE policies ADD INDEX idx_tenant_id (tenant_id);

-- Add tenant_id to annuities table
ALTER TABLE annuities ADD COLUMN tenant_id VARCHAR(64) DEFAULT 'default-tenant' AFTER id;
ALTER TABLE annuities ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE annuities ADD INDEX idx_tenant_id (tenant_id);

-- Add tenant_id to sales_entries table
ALTER TABLE sales_entries ADD COLUMN tenant_id VARCHAR(64) DEFAULT 'default-tenant' AFTER id;
ALTER TABLE sales_entries ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE sales_entries ADD INDEX idx_tenant_id (tenant_id);

-- Add tenant_id to graded_whole_life_policies table
ALTER TABLE graded_whole_life_policies ADD COLUMN tenant_id VARCHAR(64) DEFAULT 'default-tenant' AFTER id;
ALTER TABLE graded_whole_life_policies ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE graded_whole_life_policies ADD INDEX idx_tenant_id (tenant_id);

-- Add tenant_id to carriers table
ALTER TABLE carriers ADD COLUMN tenant_id VARCHAR(64) DEFAULT 'default-tenant' AFTER id;
ALTER TABLE carriers ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE carriers ADD INDEX idx_tenant_id (tenant_id);

-- Add tenant_id to app_settings table
ALTER TABLE app_settings ADD COLUMN tenant_id VARCHAR(64) DEFAULT 'default-tenant' BEFORE `key`;
ALTER TABLE app_settings DROP PRIMARY KEY;
ALTER TABLE app_settings ADD PRIMARY KEY (tenant_id, `key`);
ALTER TABLE app_settings ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Create demo tenant
INSERT INTO tenants (id, company_name, domain, subscription_status, subscription_plan, owner_email, owner_name)
VALUES ('demo-tenant-001', 'Demo Insurance Agency', 'demo.local', 'active', 'professional', 'demo@example.com', 'Demo Admin')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Clear all existing data (except demo tenant)
DELETE FROM quote_requests WHERE tenant_id = 'default-tenant';
DELETE FROM contact_submissions WHERE tenant_id = 'default-tenant';
DELETE FROM policies WHERE tenant_id = 'default-tenant';
DELETE FROM clients WHERE tenant_id = 'default-tenant';
DELETE FROM annuities WHERE tenant_id = 'default-tenant';
DELETE FROM sales_entries WHERE tenant_id = 'default-tenant';
DELETE FROM graded_whole_life_policies WHERE tenant_id = 'default-tenant';
DELETE FROM users WHERE tenant_id = 'default-tenant';
DELETE FROM carriers WHERE tenant_id = 'default-tenant';
DELETE FROM app_settings WHERE tenant_id = 'default-tenant';
