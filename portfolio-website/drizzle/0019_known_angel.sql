CREATE TABLE `referral_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`tier` enum('bronze','silver','gold','platinum') DEFAULT 'bronze',
	`totalReferrals` int DEFAULT 0,
	`totalConversions` int DEFAULT 0,
	`totalCommissions` decimal(12,2) DEFAULT '0',
	`totalBonuses` decimal(12,2) DEFAULT '0',
	`availableReward` decimal(12,2) DEFAULT '0',
	`redeemableReward` decimal(12,2) DEFAULT '0',
	`lastRewardDate` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referral_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredEmail` varchar(320) NOT NULL,
	`referredName` varchar(255) DEFAULT '',
	`referredPhone` varchar(50) DEFAULT '',
	`status` enum('pending','contacted','quoted','converted','expired') DEFAULT 'pending',
	`referralCode` varchar(50) NOT NULL,
	`commissionAmount` decimal(10,2) DEFAULT '0',
	`bonusAmount` decimal(10,2) DEFAULT '0',
	`convertedClientId` int,
	`convertedAt` bigint,
	`expiresAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
