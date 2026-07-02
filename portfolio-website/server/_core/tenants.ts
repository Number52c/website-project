/**
 * Multi-tenant configuration system
 * Manages tenant metadata, branding, and configuration
 */

export interface TenantConfig {
  id: string;
  companyName: string;
  domain: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  subscriptionStatus: 'active' | 'trial' | 'suspended' | 'cancelled';
  subscriptionPlan: 'professional' | 'enterprise';
  ownerEmail: string;
  ownerName: string;
}

/**
 * Tenant registry - stores all available tenants
 * In production, this would be loaded from the database
 */
const TENANTS_REGISTRY: Record<string, TenantConfig> = {
  'demo-tenant-001': {
    id: 'demo-tenant-001',
    companyName: 'Demo Insurance Agency',
    domain: 'demo.local',
    logoUrl: 'https://via.placeholder.com/200x200?text=Demo+Agency',
    primaryColor: '#0D1B3E',
    secondaryColor: '#D4AF37',
    subscriptionStatus: 'active',
    subscriptionPlan: 'professional',
    ownerEmail: 'demo@example.com',
    ownerName: 'Demo Admin',
  },
};

/**
 * Get tenant by ID
 */
export function getTenantById(tenantId: string): TenantConfig | null {
  return TENANTS_REGISTRY[tenantId] || null;
}

/**
 * Get tenant by domain
 */
export function getTenantByDomain(domain: string): TenantConfig | null {
  // Extract domain without port for comparison
  const cleanDomain = domain.split(':')[0].toLowerCase();

  // Check for exact match
  const tenant = Object.values(TENANTS_REGISTRY).find(
    (t) => t.domain.toLowerCase() === cleanDomain
  );

  if (tenant) return tenant;

  // Check for subdomain match (e.g., demo.myplatform.com -> demo)
  const subdomain = cleanDomain.split('.')[0];
  return (
    Object.values(TENANTS_REGISTRY).find(
      (t) => t.domain.toLowerCase().startsWith(subdomain)
    ) || null
  );
}

/**
 * List all tenants (for super-admin)
 */
export function listAllTenants(): TenantConfig[] {
  return Object.values(TENANTS_REGISTRY);
}

/**
 * Create a new tenant (for signup flow)
 * In production, this would persist to database
 */
export function createTenant(config: TenantConfig): TenantConfig {
  TENANTS_REGISTRY[config.id] = config;
  return config;
}

/**
 * Update tenant configuration
 */
export function updateTenant(
  tenantId: string,
  updates: Partial<TenantConfig>
): TenantConfig | null {
  const tenant = getTenantById(tenantId);
  if (!tenant) return null;

  const updated = { ...tenant, ...updates };
  TENANTS_REGISTRY[tenantId] = updated;
  return updated;
}

/**
 * Get default tenant (for backwards compatibility)
 */
export function getDefaultTenant(): TenantConfig {
  return TENANTS_REGISTRY['demo-tenant-001']!;
}

/**
 * Generate a unique tenant ID
 */
export function generateTenantId(): string {
  return `tenant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
