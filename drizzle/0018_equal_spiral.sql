ALTER TABLE `annuities` ADD `status` enum('active','pending','matured','surrendered','cancelled') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `annuities` ADD `isPaid` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `policies` ADD `isPaid` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `sales_entries` ADD `effectiveDate` bigint;--> statement-breakpoint
ALTER TABLE `sales_entries` ADD `isCanceled` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `annuities` DROP COLUMN `annuity_status`;--> statement-breakpoint
ALTER TABLE `sales_entries` DROP COLUMN `commissionAmount`;