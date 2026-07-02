CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50) DEFAULT '',
	`address` text,
	`city` varchar(255) DEFAULT '',
	`state` varchar(50) DEFAULT '',
	`zip` varchar(20) DEFAULT '',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`),
	CONSTRAINT `clients_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `policies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`policyNumber` varchar(100) NOT NULL,
	`type` varchar(100) NOT NULL,
	`carrier` varchar(255) NOT NULL,
	`status` enum('active','pending','expired','cancelled') NOT NULL DEFAULT 'active',
	`premiumAmount` decimal(10,2),
	`premiumFrequency` enum('monthly','quarterly','semi-annual','annual') DEFAULT 'monthly',
	`coverageAmount` decimal(14,2),
	`deductible` decimal(10,2),
	`effectiveDate` bigint,
	`expirationDate` bigint,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policies_id` PRIMARY KEY(`id`)
);
