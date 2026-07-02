CREATE TABLE `agent_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentId` int NOT NULL,
	`lastActivityAt` bigint NOT NULL,
	`createdAt` bigint NOT NULL,
	CONSTRAINT `agent_sessions_id` PRIMARY KEY(`id`)
);
