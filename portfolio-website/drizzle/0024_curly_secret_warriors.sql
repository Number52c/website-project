CREATE TABLE `appointments` (
	`id` int NOT NULL,
	`clientId` int NOT NULL,
	`appointmentType` varchar(50) NOT NULL,
	`scheduledDate` bigint NOT NULL,
	`duration` int DEFAULT 60,
	`notes` text,
	`status` varchar(20) DEFAULT 'scheduled',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `clients` ADD `lastReviewDate` bigint;--> statement-breakpoint
ALTER TABLE `appointments` ADD CONSTRAINT `appointments_clientId_clients_id_fk` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE cascade ON UPDATE no action;