CREATE TABLE `agents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`firstName` varchar(255) NOT NULL,
	`lastName` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50) DEFAULT '',
	`licenseNumber` varchar(100) DEFAULT '',
	`licenseState` varchar(2) DEFAULT '',
	`agent_status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agents_id` PRIMARY KEY(`id`),
	CONSTRAINT `agents_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `appointments` MODIFY COLUMN `id` int AUTO_INCREMENT NOT NULL;--> statement-breakpoint
ALTER TABLE `annuities` ADD `agentId` int;--> statement-breakpoint
ALTER TABLE `graded_whole_life_policies` ADD `agentId` int;--> statement-breakpoint
ALTER TABLE `policies` ADD `agentId` int;