# Add Monetization: Pink Coins, Character Inventory, Dodo Payments

You are an experienced Next.js/TypeScript/Supabase developer working inside an existing project (a 3D endless runner game built with Next.js App Router, React Three Fiber, and Tailwind — see `DID-endless-runner-prompt.md` in this repo for the game itself).

Add a monetization system: a premium currency called **"Pink Coins"**, a character **Inventory** where players spend Pink Coins to unlock cosmetics, and real-money purchases of Pink Coins via **Dodo Payments** (a Merchant of Record payment provider).

---

## 1. Already Implemented — Read These Before Writing Anything

The following files already exist in this project and are considered final. **Do not recreate, rename, or change their exported function signatures.** Read each one fully before building anything else in this spec, and import from them rather than duplicating logic.

| File | Purpose |
|---|---|
| `lib/db/schema.sql` | Full Postgres schema — run this in the Supabase SQL editor before writing any code. Defines `profiles`, `characters`, `user_characters`, `pink_coin_packages`, `orders`, RLS policies, and two RPC functions: `increment_pink_coins(p_user_id, p_amount)` and `spend_pink_coins(p_user_id, p_amount)` (atomic, race-safe balance operations). |
| `lib/db/supabase.ts` | Exports `createBrowserSupabase()` (anon key, respects RLS, safe for client components) and `createServiceSupabase()` (service-role key, bypasses RLS, **server-only**, used to credit/debit balances). |
| `lib/game/inventory-types.ts` | TypeScript types matching the schema: `Character`, `PinkCoinPackage`, `Profile`, `Order`, `InventoryCharacter`. |
| `app/api/checkout/route.ts` | `POST` — verifies the caller is logged in (this is the login gate), resolves the real package/price server-side, creates a Dodo checkout session with `{ userId, packageId }` in metadata, returns the Dodo-hosted checkout URL. |
| `app/api/webhooks/dodo/route.ts` | `POST` — verifies the Dodo webhook signature, handles `payment.completed` events, and is the **only** place Pink Coins get credited. Idempotent via a unique constraint on `dodo_payment_id` (Dodo may retry/duplicate webhook deliveries — this is expected, not a bug, and must not double-credit). |
| `app/api/unlock-character/route.ts` | `POST` — spends Pink Coins to unlock a character. Pure database operation, no Dodo involved. Uses the `spend_pink_coins` RPC so a race condition can never produce a negative balance. |
| `app/pink-coins/page.tsx` | Store page — lists packages, gates the Buy button behind login, redirects to Dodo checkout. |
| `app/success/page.tsx` | Post-checkout landing page. **Does not credit coins itself** — only polls the user's balance until the webhook (which runs independently) has landed, then shows confirmation. |
| `app/inventory/page.tsx` | Inventory grid — anyone can browse locked/unlocked characters without logging in; login is only required at the moment of unlocking. |

**Critical architectural rule to preserve:** the webhook is the sole source of truth for crediting money-purchased coins. The success page is UX only. Spending coins (unlocking characters) never touches Dodo at all — it's a separate, purely internal balance operation. Do not blur these two flows.

---

## 2. What You Need to Build

### A. `/login` page + auth flow
- Use Supabase Auth. Email/password or magic link — magic link is lower friction for a casual mobile game audience, recommend defaulting to that unless told otherwise.
- Support a `?redirect=` query param so `/pink-coins` and `/inventory` can send the user back to where they were after logging in (both pages already construct URLs like `/login?redirect=/pink-coins`).
- After successful login, redirect to the `redirect` param if present, otherwise to `/`.
- No login should be required just to browse `/pink-coins` or `/inventory` — only at the point of clicking Buy/Unlock. Preserve that pattern.

### B. Environment variables
Add these to `.env.local` (get real values from Supabase project settings and the Dodo dashboard):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_SECRET=
DODO_PAYMENTS_RETURN_URL=https://yourdomain.com/success
```
Never expose `SUPABASE_SERVICE_ROLE_KEY` or `DODO_PAYMENTS_API_KEY`/`WEBHOOK_SECRET` to the client — they must only ever be read in server-side files (API routes).

### C. Dependencies
```
npm install @supabase/ssr @supabase/supabase-js standardwebhooks
```

### D. Supabase + Dodo dashboard setup (manual steps, document these back to the user once done)
1. Run `lib/db/schema.sql` in the Supabase SQL editor.
2. In the Dodo Payments dashboard, create one Product per Pink Coin package you want to sell.
3. Insert matching rows into `pink_coin_packages`, using the real `dodo_product_id` from step 2.
4. Insert your actual character/cosmetic rows into `characters` (name, cost in Pink Coins, thumbnail/model URLs).
5. In the Dodo dashboard, register the webhook endpoint: `https://yourdomain.com/api/webhooks/dodo`.
6. Use Dodo's test mode and test cards to verify a full purchase before going live.

### E. Nav integration
Add links to `/inventory` and `/pink-coins` from the game's main menu (`GameUI.tsx` or wherever the menu currently lives), and show the logged-in user's Pink Coin balance in the HUD or menu if a session exists.

### F. Connect Inventory to the actual game
Once a character is unlocked, the game needs to actually let the player select/use it. Add:
- A "selected character" concept (stored in `profiles` or a new column — extend the schema if needed, but keep it additive, don't restructure existing tables) so the choice persists across sessions.
- `Player.tsx`/`Chaser.tsx` should read the selected character's `model_url` when rendering, falling back to the default placeholder geometry if none is selected or the model isn't loaded yet — do not break the existing placeholder-first rendering path.

---

## 3. Non-Negotiable Rules (carried over from the architecture already in place)

- **Never trust a price or coin amount sent from the client.** Always resolve `packageId`/`characterId` → real cost by querying the database server-side, exactly as `app/api/checkout/route.ts` and `app/api/unlock-character/route.ts` already do.
- **Never credit coins outside the webhook.** Not from `/success`, not from a client-side call after redirect — only `app/api/webhooks/dodo/route.ts`.
- **Always verify the webhook signature** before reading anything from the payload.
- **All balance mutations go through the RPC functions** (`increment_pink_coins`, `spend_pink_coins`), never a raw `update profiles set pink_coin_balance = ...` from application code — this is what keeps concurrent requests race-safe.
- **RLS stays on.** Client reads use the anon key and respect Row Level Security; only server routes use the service-role key to write.

---

## 4. Testing Checklist Before Calling This Done

1. Logged-out user can view `/pink-coins` and `/inventory` without being forced to log in.
2. Clicking Buy while logged out → redirected to `/login?redirect=/pink-coins` → after login, lands back on `/pink-coins`.
3. Completing a Dodo test-mode payment → `/success` shows "Coins added!" within a few seconds → balance reflected in `/inventory`.
4. Manually re-sending the same webhook event (Dodo dashboard usually supports this) does **not** double-credit the balance.
5. Unlocking a character with insufficient coins returns a clear "not enough coins" message and does not deduct anything.
6. Unlocking a character the user already owns is blocked (no double-charge).
7. Selected character actually renders in-game after unlock + selection.

Build and verify in the order above — don't move on to game integration (section 2F) until the payment and unlock flows are fully working end to end.
