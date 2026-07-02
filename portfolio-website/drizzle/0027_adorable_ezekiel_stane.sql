ALTER TABLE `agents` ADD `passwordHash` text;--> statement-breakpoint
ALTER TABLE `agents` ADD CONSTRAINT `agents_email_unique` UNIQUE(`email`);