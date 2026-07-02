-- ============================================================================
-- ORTIZ INSURANCE MASTER DATABASE SCHEMA v2
-- ============================================================================
-- This migration creates the master schema for the Ortiz Insurance system
-- with support for multi-carrier imports, client deduplication, and agent portals

-- ============================================================================
-- CREATE AGENCIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `agencies` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL UNIQUE,
  `licenseNumber` varchar(100),
  `address` text,
  `city` varchar(255),
  `state` varchar(50),
  `zip` varchar(20),
  `phone` varchar(50),
  `email` varchar(320),
  `contactPerson` varchar(255),
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_agencies_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CREATE AGENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `agents` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `userId` int UNIQUE,
  `agencyId` int,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(50),
  `licenseNumber` varchar(100) UNIQUE,
  `licenseState` varchar(2),
  `licenseExpiration` bigint,
  `nccStatus` enum('clear','pending','failed') NOT NULL DEFAULT 'pending',
  `commissionRate` decimal(5,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `agentColor` varchar(20),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_agents_agencyId` (`agencyId`),
  INDEX `idx_agents_status` (`status`),
  INDEX `idx_agents_licenseNumber` (`licenseNumber`),
  FOREIGN KEY (`agencyId`) REFERENCES `agencies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CREATE CLIENTS TABLE (MASTER CLIENT RECORD - NO DUPLICATES)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `userId` int UNIQUE,
  `householdId` int,
  `createdByAgentId` int,
  `pin` varchar(255),
  
  -- Personal Information
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `email` varchar(320) NOT NULL,
  `phone` varchar(50),
  `dateOfBirth` bigint,
  
  -- Address
  `address` text,
  `city` varchar(255),
  `state` varchar(50),
  `zip` varchar(20),
  
  -- ID & Government
  `ssn` varchar(11),
  `driverLicense` varchar(50),
  `driverLicenseState` varchar(2),
  
  -- Demographics
  `gender` varchar(20),
  `maritalStatus` varchar(50),
  `smoker` tinyint DEFAULT 0,
  
  -- Health Information
  `healthConditions` text,
  `prescriptions` text,
  `surgeries` text,
  `height` varchar(50),
  `weight` varchar(50),
  
  -- Family
  `kids` varchar(255),
  
  -- Financial
  `bankName` varchar(255),
  `accountNumber` varchar(50),
  `routingNumber` varchar(20),
  
  -- Beneficiaries
  `primaryBeneficiary` varchar(255),
  `primaryBeneficiaryPercent` int,
  `contingentBeneficiary` varchar(255),
  `contingentBeneficiaryPercent` int,
  
  -- Portal & Tracking
  `lastPortalLogin` bigint,
  `lastReviewDate` bigint,
  
  -- Notes
  `notes` text,
  
  -- Timestamps
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_clients_email` (`email`),
  INDEX `idx_clients_phone` (`phone`),
  INDEX `idx_clients_ssn` (`ssn`),
  INDEX `idx_clients_householdId` (`householdId`),
  INDEX `idx_clients_createdByAgentId` (`createdByAgentId`),
  INDEX `idx_clients_userId` (`userId`),
  INDEX `idx_clients_name` (`firstName`, `lastName`),
  FOREIGN KEY (`createdByAgentId`) REFERENCES `agents` (`id`),
  FOREIGN KEY (`householdId`) REFERENCES `clients` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CREATE POLICIES TABLE (ANNUITIES & LIFE INSURANCE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `policies` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `clientId` int NOT NULL,
  `policyNumber` varchar(100) NOT NULL UNIQUE,
  `carrier` varchar(100) NOT NULL,
  `policyType` enum(
    'term_life',
    'whole_life',
    'universal_life',
    'variable_universal_life',
    'fixed_annuity',
    'variable_annuity',
    'indexed_annuity',
    'immediate_annuity',
    'disability',
    'critical_illness',
    'other'
  ) NOT NULL,
  
  -- Policy Details
  `faceAmount` decimal(15,2),
  `monthlyPremium` decimal(12,2),
  `annualPremium` decimal(12,2),
  `premiumFrequency` enum('monthly','quarterly','semi-annual','annual'),
  
  -- Dates
  `issueDate` bigint,
  `expirationDate` bigint,
  `contractAnniversaryMonth` varchar(20),
  `renewalDate` bigint,
  
  -- Status & Underwriting
  `status` enum('pending','active','lapsed','cancelled','surrendered','matured') NOT NULL DEFAULT 'pending',
  `underwritingStatus` enum('pending','approved','declined','conditional','withdrawn') NOT NULL DEFAULT 'pending',
  
  -- Commission
  `commissionRate` decimal(5,2),
  `commissionAmount` decimal(12,2),
  `commissionPaidDate` bigint,
  
  -- Additional Details
  `notes` text,
  `internalNotes` text,
  
  -- Timestamps
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_policies_clientId` (`clientId`),
  INDEX `idx_policies_policyNumber` (`policyNumber`),
  INDEX `idx_policies_carrier` (`carrier`),
  INDEX `idx_policies_policyType` (`policyType`),
  INDEX `idx_policies_status` (`status`),
  INDEX `idx_policies_underwritingStatus` (`underwritingStatus`),
  FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CREATE BENEFICIARIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `beneficiaries` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `policyId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `relationship` varchar(100),
  `percentage` int NOT NULL,
  `ssn` varchar(11),
  `dateOfBirth` bigint,
  `type` enum('primary','secondary','contingent') NOT NULL DEFAULT 'primary',
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_beneficiaries_policyId` (`policyId`),
  INDEX `idx_beneficiaries_type` (`type`),
  FOREIGN KEY (`policyId`) REFERENCES `policies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CREATE POLICY-AGENT JUNCTION TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `policy_agents` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `policyId` int NOT NULL,
  `agentId` int NOT NULL,
  `role` enum('originating','manager','override','servicing') NOT NULL DEFAULT 'originating',
  `commissionPercent` decimal(5,2),
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_policyAgents_policyId` (`policyId`),
  INDEX `idx_policyAgents_agentId` (`agentId`),
  INDEX `idx_policyAgents_role` (`role`),
  UNIQUE KEY `unique_policy_agent` (`policyId`, `agentId`, `role`),
  FOREIGN KEY (`policyId`) REFERENCES `policies` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`agentId`) REFERENCES `agents` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CREATE IMPORTS TABLE (AUDIT LOG)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `imports` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `agentId` int,
  `fileName` varchar(255) NOT NULL,
  `fileSize` int,
  `carrier` varchar(100) NOT NULL,
  `importDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `totalRecords` int NOT NULL DEFAULT 0,
  `successfulRecords` int NOT NULL DEFAULT 0,
  `failedRecords` int NOT NULL DEFAULT 0,
  `skippedRecords` int NOT NULL DEFAULT 0,
  `status` enum('pending','processing','completed','failed','partial') NOT NULL DEFAULT 'pending',
  `mappingConfig` text,
  `errorLog` text,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_imports_agentId` (`agentId`),
  INDEX `idx_imports_carrier` (`carrier`),
  INDEX `idx_imports_status` (`status`),
  INDEX `idx_imports_importDate` (`importDate`),
  FOREIGN KEY (`agentId`) REFERENCES `agents` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- CREATE IMPORT ERRORS TABLE (DETAILED ERROR TRACKING)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `import_errors` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `importId` int NOT NULL,
  `rowNumber` int NOT NULL,
  `rawData` text NOT NULL,
  `mappedData` text,
  `errorMessage` text NOT NULL,
  `errorCode` varchar(50),
  `severity` enum('warning','error','critical') NOT NULL DEFAULT 'error',
  `resolved` tinyint NOT NULL DEFAULT 0,
  `resolutionNotes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_importErrors_importId` (`importId`),
  INDEX `idx_importErrors_rowNumber` (`rowNumber`),
  INDEX `idx_importErrors_severity` (`severity`),
  INDEX `idx_importErrors_resolved` (`resolved`),
  FOREIGN KEY (`importId`) REFERENCES `imports` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify all tables were created:
-- SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('agencies', 'agents', 'clients', 'policies', 'beneficiaries', 'policy_agents', 'imports', 'import_errors');
