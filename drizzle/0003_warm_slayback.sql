ALTER TABLE `clients` MODIFY COLUMN `userId` int;--> statement-breakpoint
ALTER TABLE `clients` ADD `pin` varchar(10) NOT NULL;