ALTER TABLE "resource" ADD COLUMN "review_status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
-- The rows that were already in the catalogue when review status arrived have
-- been listed for a while, so they are read as reviewed rather than left in a
-- queue that does not exist. New submissions start at the column's default.
UPDATE "resource" SET "review_status" = 'approved' WHERE "submitted_by_id" IS NOT NULL;
