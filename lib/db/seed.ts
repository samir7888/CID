import { characters } from "./schema";
import type { AppDatabase } from "./queries";

export const CHARACTER_SEED = [
  {
    id: "agent",
    name: "THE AGENT",
    description: "The original escape specialist.",
    cost: 0,
    thumbnailUrl: null as string | null,
    modelUrl: null as string | null,
    isDefault: true,
  },
  {
    id: "girl",
    name: "THE RUNNER",
    description:
      "A new recruit with a fearless stride and a clean getaway record.",
    cost: 50,
    thumbnailUrl: null,
    modelUrl: "/models/girl.glb",
    isDefault: false,
  },
  {
    id: "modi",
    name: "MODI",
    description: "A determined operative with one more mission to outrun.",
    cost: 100,
    thumbnailUrl: null,
    modelUrl: "/models/modi.glb",
    isDefault: false,
  },
];

export async function seedCharacters(db: AppDatabase) {
  for (const character of CHARACTER_SEED) {
    await db
      .insert(characters)
      .values(character)
      .onConflictDoUpdate({
        target: characters.id,
        set: {
          name: character.name,
          description: character.description,
          cost: character.cost,
          modelUrl: character.modelUrl,
          isDefault: character.isDefault,
        },
      });
  }
}
