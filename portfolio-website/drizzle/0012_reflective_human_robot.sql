ALTER TABLE `clients` ADD `primaryBeneficiary` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `primaryBeneficiaryPercent` int;--> statement-breakpoint
ALTER TABLE `clients` ADD `contingentBeneficiary` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `contingentBeneficiaryPercent` int;