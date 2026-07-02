CREATE TABLE `annuities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int,
	`clientName` varchar(255) NOT NULL,
	`type` enum('FIA','MYGA') NOT NULL,
	`carrier` varchar(255) NOT NULL,
	`productName` varchar(255) DEFAULT '',
	`premium` decimal(14,2) NOT NULL,
	`termYears` int,
	`guaranteedRate` decimal(5,2),
	`annuity_status` enum('active','pending','matured','surrendered','cancelled') NOT NULL DEFAULT 'active',
	`effectiveDate` bigint,
	`maturityDate` bigint,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `annuities_id` PRIMARY KEY(`id`)
);
