-- Phase 4: Client Documents and Payment Methods/History Tables

-- ============================================================================
-- CLIENT DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS `client_documents` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `clientId` int NOT NULL,
  `policyId` int,
  `uploadedByAgentId` int,
  `uploadedByAdminId` int,
  
  -- Document Metadata
  `fileName` varchar(255) NOT NULL,
  `fileType` varchar(50),
  `fileSizeBytes` int,
  `storageKey` varchar(500),
  `storageUrl` text,
  
  -- Document Classification
  `documentType` enum('policy_document', 'illustration', 'application', 'disclosure', 'correspondence', 'statement', 'receipt', 'other') DEFAULT 'other',
  
  -- Visibility & Permissions
  `visibleToClient` tinyint DEFAULT 1,
  `visibleToAgent` tinyint DEFAULT 1,
  
  -- Metadata
  `description` text,
  `uploadedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` bigint,
  
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX `idx_clientDocuments_clientId` (`clientId`),
  INDEX `idx_clientDocuments_policyId` (`policyId`),
  INDEX `idx_clientDocuments_documentType` (`documentType`),
  INDEX `idx_clientDocuments_visibleToClient` (`visibleToClient`),
  INDEX `idx_clientDocuments_uploadedAt` (`uploadedAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PAYMENT METHODS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `clientId` int NOT NULL,
  
  -- Payment Method Type
  `methodType` enum('bank_account', 'credit_card', 'debit_card', 'check', 'ach', 'other') NOT NULL,
  
  -- Bank Account Details
  `bankName` varchar(255),
  `accountType` enum('checking', 'savings'),
  `accountNumberLast4` varchar(4),
  `routingNumber` varchar(20),
  
  -- Card Details
  `cardholderName` varchar(255),
  `cardNumberLast4` varchar(4),
  `cardBrand` varchar(50),
  `expiryMonth` int,
  `expiryYear` int,
  
  -- Status & Preferences
  `isDefault` tinyint DEFAULT 0,
  `isActive` tinyint DEFAULT 1,
  
  -- Metadata
  `addedAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `lastUsedAt` bigint,
  
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX `idx_paymentMethods_clientId` (`clientId`),
  INDEX `idx_paymentMethods_isDefault` (`isDefault`),
  INDEX `idx_paymentMethods_isActive` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PAYMENT HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS `payment_history` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `clientId` int NOT NULL,
  `paymentMethodId` int,
  `policyId` int,
  
  -- Payment Details
  `amount` decimal(12, 2) NOT NULL,
  `paymentDate` bigint NOT NULL,
  `paymentType` enum('premium_payment', 'annuity_payment', 'partial_payment', 'refund', 'adjustment', 'other') DEFAULT 'premium_payment',
  
  -- Payment Status
  `status` enum('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
  
  -- Transaction Details
  `transactionId` varchar(255),
  `referenceNumber` varchar(100),
  `notes` text,
  `failureReason` text,
  
  -- Metadata
  `processedAt` bigint,
  `confirmedAt` bigint,
  
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX `idx_paymentHistory_clientId` (`clientId`),
  INDEX `idx_paymentHistory_policyId` (`policyId`),
  INDEX `idx_paymentHistory_paymentDate` (`paymentDate`),
  INDEX `idx_paymentHistory_status` (`status`),
  INDEX `idx_paymentHistory_transactionId` (`transactionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
