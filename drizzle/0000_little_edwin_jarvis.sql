CREATE TYPE "public"."actor" AS ENUM('guest', 'admin', 'bot', 'system');--> statement-breakpoint
CREATE TYPE "public"."address_form" AS ENUM('ty', 'vy');--> statement-breakpoint
CREATE TYPE "public"."age_group" AS ENUM('adult', 'teen', 'child');--> statement-breakpoint
CREATE TYPE "public"."audience" AS ENUM('family', 'friends', 'colleagues');--> statement-breakpoint
CREATE TYPE "public"."guest_origin" AS ENUM('preset', 'companion');--> statement-breakpoint
CREATE TYPE "public"."notification_kind" AS ENUM('link_confirm', 'rsvp_m1', 'rsvp_w1', 'rsvp_final', 'day_before', 'admin_alert');--> statement-breakpoint
CREATE TYPE "public"."plus_one_policy" AS ENUM('none', 'named', 'open');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('single', 'multi', 'text');--> statement-breakpoint
CREATE TYPE "public"."rsvp_status" AS ENUM('pending', 'accepted', 'declined');--> statement-breakpoint
CREATE TYPE "public"."seat_request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "guest_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"question_key" text NOT NULL,
	"value" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"first_name" text,
	"last_name" text,
	"origin" "guest_origin" NOT NULL,
	"added_by_guest_id" uuid,
	"is_primary" boolean DEFAULT false NOT NULL,
	"age_group" "age_group" DEFAULT 'adult' NOT NULL,
	"rsvp" "rsvp_status" DEFAULT 'pending' NOT NULL,
	"rsvp_at" timestamp with time zone,
	"seat_confirmed" boolean DEFAULT true NOT NULL,
	"normalized_name" text GENERATED ALWAYS AS (btrim(regexp_replace(translate(lower(coalesce(first_name, '') || ' ' || coalesce(last_name, '')), 'ё-''ʼ’', 'е'), '[[:space:]]+', ' ', 'g'))) STORED,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"party_id" uuid,
	"greeting_name" text NOT NULL,
	"category" "audience" NOT NULL,
	"address_form" "address_form" DEFAULT 'vy' NOT NULL,
	"seats" integer DEFAULT 1 NOT NULL,
	"plus_one_policy" "plus_one_policy" DEFAULT 'none' NOT NULL,
	"personal_note" text,
	"admin_comment" text,
	"first_opened_at" timestamp with time zone,
	"last_opened_at" timestamp with time zone,
	"rsvp_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invites_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"chat_id" bigint,
	"kind" "notification_kind" NOT NULL,
	"dedupe_key" text NOT NULL,
	"scheduled_for" timestamp with time zone NOT NULL,
	"sent_at" timestamp with time zone,
	"telegram_message_id" bigint,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notifications_dedupe_key_unique" UNIQUE("dedupe_key")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"key" text PRIMARY KEY NOT NULL,
	"type" "question_type" NOT NULL,
	"title" text NOT NULL,
	"hint" text,
	"options" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"audience" "audience"[] NOT NULL,
	"applies_to" "age_group"[] NOT NULL,
	"required" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rsvp_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"guest_id" uuid,
	"actor" "actor" NOT NULL,
	"type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seat_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invite_id" uuid NOT NULL,
	"requested_by_guest_id" uuid NOT NULL,
	"extra_seats" integer NOT NULL,
	"comment" text,
	"status" "seat_request_status" DEFAULT 'pending' NOT NULL,
	"decided_at" timestamp with time zone,
	"decided_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_chats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chat_id" bigint NOT NULL,
	"invite_id" uuid NOT NULL,
	"username" text,
	"tg_first_name" text,
	"linked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"last_interaction_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "telegram_chats_chat_id_unique" UNIQUE("chat_id")
);
--> statement-breakpoint
ALTER TABLE "guest_answers" ADD CONSTRAINT "guest_answers_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_answers" ADD CONSTRAINT "guest_answers_question_key_questions_key_fk" FOREIGN KEY ("question_key") REFERENCES "public"."questions"("key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvp_events" ADD CONSTRAINT "rsvp_events_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvp_events" ADD CONSTRAINT "rsvp_events_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_requests" ADD CONSTRAINT "seat_requests_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seat_requests" ADD CONSTRAINT "seat_requests_requested_by_guest_id_guests_id_fk" FOREIGN KEY ("requested_by_guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "telegram_chats" ADD CONSTRAINT "telegram_chats_invite_id_invites_id_fk" FOREIGN KEY ("invite_id") REFERENCES "public"."invites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "guest_answers_guest_question_uq" ON "guest_answers" USING btree ("guest_id","question_key");--> statement-breakpoint
CREATE INDEX "guests_invite_id_idx" ON "guests" USING btree ("invite_id");--> statement-breakpoint
CREATE INDEX "guests_rsvp_idx" ON "guests" USING btree ("rsvp");--> statement-breakpoint
CREATE UNIQUE INDEX "guests_invite_normalized_name_uq" ON "guests" USING btree ("invite_id","normalized_name") WHERE first_name is not null;--> statement-breakpoint
CREATE INDEX "invites_party_id_idx" ON "invites" USING btree ("party_id");--> statement-breakpoint
CREATE INDEX "invites_category_idx" ON "invites" USING btree ("category");--> statement-breakpoint
CREATE INDEX "rsvp_events_invite_id_idx" ON "rsvp_events" USING btree ("invite_id");