CREATE TABLE `graded_whole_life_policies` (
	`id` int AUTO_INCREMENT NOT NULL,
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
