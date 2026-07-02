CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('cell_phone','leads','crm','wavv_dialer','miscellaneous') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`description` text,
	`expenseMonth` int NOT NULL,
	`expenseYear` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
