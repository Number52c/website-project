ALTER TABLE `clients` ADD `dateOfBirth` bigint;--> statement-breakpoint
ALTER TABLE `clients` ADD `ssn` varchar(11);--> statement-breakpoint
ALTER TABLE `clients` ADD `driverLicense` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `driverLicenseState` varchar(2);--> statement-breakpoint
ALTER TABLE `clients` ADD `healthConditions` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `bankName` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `accountNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `routingNumber` varchar(20);