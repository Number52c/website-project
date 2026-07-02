-- Add salesEntries table for tracking individual sales/policies
CREATE TABLE IF NOT EXISTS `sales_entries` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `agentId` int NOT NULL,
  `clientId` int,
  `clientName` varchar(255) NOT NULL,
  `carrier` varchar(100) NOT NULL,
  `product` varchar(255) NOT NULL,
  `premium` decimal(12, 2),
  `annualPremium` decimal(12, 2),
  `commission` decimal(12, 2),
  `saleDate` bigint,
  `policyType` varchar(50),
  `status` varchar(50) DEFAULT 'active',
  `notes` text,
  `month` int,
  `year` int,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_salesEntries_agentId` (`agentId`),
  KEY `idx_salesEntries_clientId` (`clientId`),
  KEY `idx_salesEntries_saleDate` (`saleDate`),
  KEY `idx_salesEntries_monthYear` (`month`, `year`),
  CONSTRAINT `fk_salesEntries_agentId` FOREIGN KEY (`agentId`) REFERENCES `agents` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_salesEntries_clientId` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE SET NULL
);

-- Add expenses table for tracking agent business expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `agentId` int NOT NULL,
  `description` varchar(255) NOT NULL,
  `amount` decimal(12, 2) NOT NULL,
  `category` varchar(100),
  `expenseDate` bigint NOT NULL,
  `month` int NOT NULL,
  `year` int NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_expenses_agentId` (`agentId`),
  KEY `idx_expenses_monthYear` (`month`, `year`),
  CONSTRAINT `fk_expenses_agentId` FOREIGN KEY (`agentId`) REFERENCES `agents` (`id`) ON DELETE CASCADE
);

-- Add appSettings table for system configuration
CREATE TABLE IF NOT EXISTS `app_settings` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `key` varchar(255) NOT NULL UNIQUE,
  `value` text NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_appSettings_key` (`key`)
);

-- Add carriers table for insurance carriers/companies
CREATE TABLE IF NOT EXISTS `carriers` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL UNIQUE,
  `shortName` varchar(50),
  `type` enum('life', 'annuity', 'health', 'other') DEFAULT 'life',
  `active` tinyint DEFAULT 1,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_carriers_name` (`name`),
  KEY `idx_carriers_shortName` (`shortName`)
);
