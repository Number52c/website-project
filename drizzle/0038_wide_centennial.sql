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
