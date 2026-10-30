ALTER TABLE "resource" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "favicon_url" text;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "image_width" integer;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "image_height" integer;--> statement-breakpoint
ALTER TABLE "resource" ADD COLUMN "image_checked_at" timestamp;