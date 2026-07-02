ALTER TABLE `policies` ADD `paymentStatus` enum('received','pending','failed') DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE `policies` ADD `lastReviewDate` bigint;--> statement-breakpoint
ALTER TABLE `policies` ADD `nextReviewDueDate` bigint;