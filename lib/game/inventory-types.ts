export interface Character {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  thumbnail_url: string | null;
  model_url: string | null;
  is_default: boolean;
}

export interface PinkCoinPackage {
  id: string;
  name: string;
  pink_coins: number;
  price_minor: number;
  currency: string;
  dodo_product_id: string;
  active: boolean;
}

export interface Profile {
  id: string;
  pink_coin_balance: number;
  selected_character_id: string | null;
}

export interface Order {
  id: string;
  user_id: string;
  package_id: string;
  dodo_payment_id: string | null;
  pink_coins: number;
  status: string;
}

export interface InventoryCharacter extends Character {
  unlocked: boolean;
}