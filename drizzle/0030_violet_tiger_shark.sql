ALTER TABLE `clients` ADD `age` varchar(3);--> statement-breakpoint
ALTER TABLE `clients` ADD `gender` varchar(20);--> statement-breakpoint
ALTER TABLE `clients` ADD `smoker` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `clients` ADD `goal` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `medicalConditions` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `healthConditionsJSON` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `prescriptions` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `surgeries` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `height` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `weight` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `maritalStatus` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `kids` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `additionalHealthNotes` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `placeOfBirth` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `citizenship` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `resident` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `clients` ADD `cardNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `cardExpiration` varchar(10);--> statement-breakpoint
ALTER TABLE `clients` ADD `doctorOrClinic` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `lastVisit` bigint;--> statement-breakpoint
ALTER TABLE `clients` ADD `doctorPhone` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `doctorAddress` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `beneficiary1Name` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `beneficiary1DOB` bigint;--> statement-breakpoint
ALTER TABLE `clients` ADD `beneficiary1Relationship` varchar(100);--> statement-breakpoint
ALTER TABLE `clients` ADD `beneficiary2Name` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `beneficiary2DOB` bigint;--> statement-breakpoint
ALTER TABLE `clients` ADD `beneficiary2Relationship` varchar(100);--> statement-breakpoint
ALTER TABLE `clients` ADD `beneficiary3Name` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `beneficiary3DOB` bigint;--> statement-breakpoint
ALTER TABLE `clients` ADD `beneficiary3Relationship` varchar(100);--> statement-breakpoint
ALTER TABLE `clients` ADD `bankAccountType` varchar(50);--> statement-breakpoint
ALTER TABLE `clients` ADD `carrier` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `productPolicyType` varchar(255);--> statement-breakpoint
ALTER TABLE `clients` ADD `policyNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `clients` ADD `coverageDeathBenefit` varchar(100);--> statement-breakpoint
ALTER TABLE `clients` ADD `monthlyPremium` varchar(100);--> statement-breakpoint
ALTER TABLE `clients` ADD `annualPremium` varchar(100);--> statement-breakpoint
ALTER TABLE `clients` ADD `effectiveDate` bigint;--> statement-breakpoint
ALTER TABLE `clients` ADD `statusSelected` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `clients` ADD `statusDenied` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `clients` ADD `existingLifeInsuranceSource` text;