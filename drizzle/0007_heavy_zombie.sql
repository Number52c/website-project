CREATE TABLE `sales_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`productType` varchar(100) NOT NULL,
	`carrier` varchar(255) NOT NULL,
	`premium` decimal(14,2) NOT NULL,
	`annualPremium` decimal(14,2),
	`commissionPercent` decimal(5,2),
	`commissionAmount` decimal(14,2),
	`saleDate` bigint NOT NULL,
	`saleMonth` int NOT NULL,
	`saleYear` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_entries_id` PRIMARY KEY(`id`)
);
