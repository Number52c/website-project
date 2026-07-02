CREATE TABLE `carriers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`portalUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carriers_id` PRIMARY KEY(`id`),
	CONSTRAINT `carriers_name_unique` UNIQUE(`name`)
);
