-- ============================================================================
-- MIGRATION: Rename agent columns to match TypeScript schema
-- ============================================================================
-- This migration renames the following columns in the agents table:
-- - status → agentStatus
-- - agentColor → color
-- This preserves all existing data while aligning the database schema with the TypeScript definitions

ALTER TABLE `agents` 
CHANGE COLUMN `status` `agentStatus` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
CHANGE COLUMN `agentColor` `color` varchar(20);

-- Update indexes if needed
DROP INDEX IF EXISTS `idx_agents_status` ON `agents`;
CREATE INDEX `idx_agents_agentStatus` ON `agents` (`agentStatus`);
