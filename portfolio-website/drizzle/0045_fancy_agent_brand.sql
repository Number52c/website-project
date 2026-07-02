CREATE TABLE `agent_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int,
	`carrier` varchar(255) NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`writingNumber` varchar(100) DEFAULT '',
	`appointmentDate` varchar(50) DEFAULT '',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_onboarding_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`beforeYouStartCompleted` tinyint DEFAULT 0,
	`step1HcmsInviteSent` tinyint DEFAULT 0,
	`step1HcmsInviteCompletedAt` bigint,
	`step2EmailSequenceCompleted` tinyint DEFAULT 0,
	`step2EmailSequenceCompletedAt` bigint,
	`step2SureLcCompleted` tinyint DEFAULT 0,
	`step2SureLcCompletedAt` bigint,
	`step3NlcContractsSubmitted` tinyint DEFAULT 0,
	`step3NlcContractsSubmittedAt` bigint,
	`step4AdditionalContractsSent` tinyint DEFAULT 0,
	`step4AdditionalContractsSentAt` bigint,
	`onboardingCompleted` tinyint DEFAULT 0,
	`onboardingCompletedAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_onboarding_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `agent_onboarding_progress_agentId_unique` UNIQUE(`agentId`)
);
--> statement-breakpoint
CREATE TABLE `agent_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`lastActivityAt` bigint NOT NULL,
	`createdAt` bigint NOT NULL,
	CONSTRAINT `agent_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50) DEFAULT '',
	`licenseNumber` varchar(100) DEFAULT '',
	`licenseState` varchar(2) DEFAULT '',
	`passwordHash` text,
	`passwordChangedAt` bigint,
	`pin` varchar(255),
	`color` varchar(50) DEFAULT 'blue',
	`profilePictureUrl` text,
	`agent_status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `agents_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `annuities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int,
	`clientId` int,
	`clientName` varchar(255) NOT NULL,
	`type` enum('FIA','MYGA') NOT NULL,
	`carrier` varchar(255) NOT NULL,
	`productName` varchar(255) DEFAULT '',
	`premium` decimal(14,2) NOT NULL,
	`termYears` int,
	`commissionPercent` decimal(5,2),
	`status` enum('active','pending','matured','surrendered','cancelled') NOT NULL DEFAULT 'active',
	`isPaid` tinyint NOT NULL DEFAULT 0,
	`effectiveDate` bigint,
	`maturityDate` bigint,
	`notes` text,
	`beneficiary` varchar(255),
	`rolledOverFrom` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `annuities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `app_settings` (
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `app_settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int,
	`clientName` varchar(255) NOT NULL,
	`clientEmail` varchar(320) NOT NULL,
	`clientPhone` varchar(50) NOT NULL,
	`appointmentType` varchar(50) NOT NULL,
	`professionalType` varchar(50),
	`scheduledDate` bigint,
	`appointmentDate` varchar(10),
	`appointmentTime` varchar(5),
	`duration` int DEFAULT 60,
	`notes` text,
	`status` varchar(20) DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(100) NOT NULL,
	`entityId` int NOT NULL,
	`oldValues` text,
	`newValues` text,
	`description` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `carriers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`portalUrl` text,
	`website` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carriers_id` PRIMARY KEY(`id`),
	CONSTRAINT `carriers_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `client_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`primaryClientId` int NOT NULL,
	`linkedClientId` int NOT NULL,
	`relationship` varchar(50) DEFAULT 'spouse',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`agentId` int,
	`householdId` int,
	`pin` varchar(255) NOT NULL,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50) DEFAULT '',
	`address` text,
	`city` varchar(255) DEFAULT '',
	`state` varchar(50) DEFAULT '',
	`zip` varchar(20) DEFAULT '',
	`dateOfBirth` bigint,
	`ssn` varchar(11),
	`driverLicense` varchar(50),
	`driverLicenseState` varchar(2),
	`healthConditions` text,
	`bankName` varchar(255),
	`accountNumber` varchar(50),
	`routingNumber` varchar(20),
	`primaryBeneficiary` varchar(255),
	`primaryBeneficiaryPercent` int,
	`contingentBeneficiary` varchar(255),
	`contingentBeneficiaryPercent` int,
	`lastPortalLogin` bigint,
	`lastReviewDate` bigint,
	`age` varchar(3),
	`gender` varchar(20),
	`smoker` tinyint DEFAULT 0,
	`goal` text,
	`medicalConditions` text,
	`healthConditionsJSON` text,
	`prescriptions` text,
	`surgeries` text,
	`height` varchar(50),
	`weight` varchar(50),
	`maritalStatus` varchar(50),
	`kids` varchar(255),
	`additionalHealthNotes` text,
	`placeOfBirth` varchar(255),
	`citizenship` varchar(50),
	`resident` tinyint DEFAULT 0,
	`cardNumber` varchar(50),
	`cardExpiration` varchar(10),
	`doctorOrClinic` varchar(255),
	`lastVisit` bigint,
	`doctorPhone` varchar(50),
	`doctorAddress` text,
	`beneficiary1Name` varchar(255),
	`beneficiary1DOB` bigint,
	`beneficiary1Relationship` varchar(100),
	`beneficiary2Name` varchar(255),
	`beneficiary2DOB` bigint,
	`beneficiary2Relationship` varchar(100),
	`beneficiary3Name` varchar(255),
	`beneficiary3DOB` bigint,
	`beneficiary3Relationship` varchar(100),
	`bankAccountType` varchar(50),
	`carrier` varchar(255),
	`productPolicyType` varchar(255),
	`policyNumber` varchar(100),
	`coverageDeathBenefit` varchar(100),
	`monthlyPremium` varchar(100),
	`annualPremium` varchar(100),
	`effectiveDate` bigint,
	`statusSelected` tinyint DEFAULT 0,
	`statusDenied` tinyint DEFAULT 0,
	`existingLifeInsuranceSource` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `contact_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50) DEFAULT '',
	`subject` varchar(255) DEFAULT '',
	`message` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contact_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int,
	`category` enum('cell_phone','leads','crm','wavv_dialer','miscellaneous') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`description` text,
	`expenseMonth` int NOT NULL,
	`expenseYear` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `graded_whole_life_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int,
	`clientId` int,
	`clientName` varchar(255) NOT NULL,
	`carrier` varchar(255) NOT NULL,
	`policyNumber` varchar(100) DEFAULT '',
	`premium` decimal(14,2) NOT NULL,
	`gwl_premiumFrequency` enum('monthly','quarterly','semi-annual','annual') DEFAULT 'monthly',
	`yearlyAP` decimal(10,2),
	`commissionPercent` decimal(5,2),
	`faceAmount` decimal(14,2),
	`gwl_status` enum('active','pending','lapsed','cancelled') NOT NULL DEFAULT 'active',
	`effectiveDate` bigint,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `graded_whole_life_policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `login_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ipAddress` varchar(45) NOT NULL,
	`attemptCount` int NOT NULL DEFAULT 0,
	`lastAttemptAt` timestamp NOT NULL DEFAULT (now()),
	`lockedUntil` timestamp,
	CONSTRAINT `login_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_revenue_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int,
	`year` int NOT NULL,
	`month` int NOT NULL,
	`totalCommission` decimal(14,2) NOT NULL,
	`totalExpenses` decimal(14,2) NOT NULL,
	`netRevenue` decimal(14,2) NOT NULL,
	`activePolicies` int NOT NULL,
	`activeBookAP` decimal(14,2) NOT NULL,
	`lastCalculatedAt` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monthly_revenue_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`usedAt` timestamp,
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `persistence_rate_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int,
	`year` int NOT NULL,
	`activeLifePolicies` int NOT NULL,
	`cancelledThisYear` int NOT NULL,
	`persistenceRate` decimal(5,2) NOT NULL,
	`lastCalculatedAt` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `persistence_rate_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int,
	`clientId` int NOT NULL,
	`policyNumber` varchar(100) NOT NULL,
	`type` varchar(100) NOT NULL,
	`carrier` varchar(255) NOT NULL,
	`status` enum('active','pending','expired','cancelled') NOT NULL DEFAULT 'active',
	`premiumAmount` decimal(10,2),
	`premiumFrequency` enum('monthly','quarterly','semi-annual','annual') DEFAULT 'monthly',
	`coverageAmount` decimal(14,2),
	`yearlyAP` decimal(10,2),
	`deductible` decimal(10,2),
	`isPaid` tinyint NOT NULL DEFAULT 0,
	`effectiveDate` bigint,
	`expirationDate` bigint,
	`description` text,
	`paymentMethod` varchar(50),
	`paymentMethodLast4` varchar(4),
	`beneficiaries` text,
	`draftDate` varchar(20),
	`riders` text,
	`notes` text,
	`paymentStatus` enum('received','pending','failed') NOT NULL DEFAULT 'pending',
	`lastReviewDate` bigint,
	`nextReviewDueDate` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`coverage` varchar(255) NOT NULL,
	`bestTime` varchar(50) DEFAULT '',
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quote_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referral_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`tier` enum('bronze','silver','gold','platinum') DEFAULT 'bronze',
	`totalReferrals` int DEFAULT 0,
	`totalConversions` int DEFAULT 0,
	`totalCommissions` decimal(12,2) DEFAULT '0',
	`totalBonuses` decimal(12,2) DEFAULT '0',
	`availableReward` decimal(12,2) DEFAULT '0',
	`redeemableReward` decimal(12,2) DEFAULT '0',
	`lastRewardDate` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredEmail` varchar(320) NOT NULL,
	`referredName` varchar(255) DEFAULT '',
	`referredPhone` varchar(50) DEFAULT '',
	`status` enum('pending','contacted','quoted','converted','expired') DEFAULT 'pending',
	`referralCode` varchar(50) NOT NULL,
	`commissionAmount` decimal(10,2) DEFAULT '0',
	`bonusAmount` decimal(10,2) DEFAULT '0',
	`convertedClientId` int,
	`convertedAt` bigint,
	`expiresAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
--> statement-breakpoint
CREATE TABLE `sales_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int,
	`clientName` varchar(255) NOT NULL,
	`productType` varchar(100) NOT NULL,
	`carrier` varchar(255) NOT NULL,
	`premium` decimal(14,2) NOT NULL,
	`annualPremium` decimal(14,2),
	`commissionPercent` decimal(5,2),
	`commissionOverride` decimal(5,2),
	`effectiveDate` bigint,
	`isPaid` tinyint NOT NULL DEFAULT 0,
	`isCanceled` tinyint NOT NULL DEFAULT 0,
	`saleDate` bigint NOT NULL,
	`saleMonth` int NOT NULL,
	`saleYear` int NOT NULL,
	`agent` varchar(255),
	`notes` text,
	`tagColor` varchar(50) DEFAULT 'default',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `session_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(255) NOT NULL,
	`userId` int,
	`userType` varchar(50) NOT NULL,
	`lastActiveAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	CONSTRAINT `session_activity_id` PRIMARY KEY(`id`),
	CONSTRAINT `session_activity_sessionId_unique` UNIQUE(`sessionId`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','agent') NOT NULL DEFAULT 'user',
	`agentId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;