CREATE TABLE "characters" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cost" integer DEFAULT 0 NOT NULL,
	"thumbnail_url" text,
	"model_url" text,
	"is_default" boolean DEFAULT false NOT NULL,
	CONSTRAINT "characters_cost_non_negative" CHECK ("characters"."cost" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"package_id" text NOT NULL,
	"dodo_payment_id" text,
	"pink_coins" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_dodo_payment_id_unique" UNIQUE("dodo_payment_id"),
	CONSTRAINT "orders_pink_coins_positive" CHECK ("orders"."pink_coins" > 0)
);
--> statement-breakpoint
CREATE TABLE "pink_coin_packages" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"pink_coins" integer NOT NULL,
	"price_minor" integer NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"dodo_product_id" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "pink_coin_packages_dodo_product_id_unique" UNIQUE("dodo_product_id"),
	CONSTRAINT "packages_pink_coins_positive" CHECK ("pink_coin_packages"."pink_coins" > 0),
	CONSTRAINT "packages_price_minor_positive" CHECK ("pink_coin_packages"."price_minor" > 0)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"pink_coin_balance" integer DEFAULT 0 NOT NULL,
	"selected_character_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_pink_coin_balance_non_negative" CHECK ("profiles"."pink_coin_balance" >= 0)
);
--> statement-breakpoint
CREATE TABLE "user_characters" (
	"user_id" text NOT NULL,
	"character_id" text NOT NULL,
	"unlocked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_characters_user_id_character_id_pk" PRIMARY KEY("user_id","character_id")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_package_id_pink_coin_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."pink_coin_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_characters" ADD CONSTRAINT "user_characters_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_characters" ADD CONSTRAINT "user_characters_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;