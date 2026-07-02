CREATE TABLE `client_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`primaryClientId` int NOT NULL,
	`linkedClientId` int NOT NULL,
	`relationship` varchar(50) DEFAULT 'spouse',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `client_links_id` PRIMARY KEY(`id`)
);
