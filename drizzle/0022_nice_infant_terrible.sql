ALTER TABLE `annuities` ADD `beneficiary` varchar(255);--> statement-breakpoint
ALTER TABLE `annuities` ADD `rolledOverFrom` varchar(255);--> statement-breakpoint
ALTER TABLE `policies` ADD `paymentMethod` varchar(50);--> statement-breakpoint
ALTER TABLE `policies` ADD `paymentMethodLast4` varchar(4);--> statement-breakpoint
ALTER TABLE `policies` ADD `beneficiaries` text;--> statement-breakpoint
ALTER TABLE `policies` ADD `draftDate` varchar(20);