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
