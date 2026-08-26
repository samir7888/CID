export interface CharacterDefinition {
  id: string;
  name: string;
  role: string;
  description: string;
  modelPath?: string;
  modelScale?: number;
  modelYOffset?: number;
}

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: "agent",
    name: "THE AGENT",
    role: "FIELD OPERATIVE",
    description:
      "The original escape specialist. Fast, focused, and ready to run.",
  },
  {
    id: "girl",
    name: "THE RUNNER",
    role: "NEW RECRUIT",
    description:
      "A new recruit with a fearless stride and a clean getaway record.",
    modelPath: "/models/girl.glb",
    modelScale: 0.92,
    modelYOffset: 0.8,
  },
  {
    id: "modi",
    name: "MODI",
    role: "SPECIAL OPERATIVE",
    description: "A determined operative with one more mission to outrun.",
    modelPath: "/models/modi.glb",
    modelScale: 0.92,
    modelYOffset: 0.8,
  },
];

export const DEFAULT_CHARACTER_ID = CHARACTERS[0].id;
export const CHARACTER_STORAGE_KEY = "did-selected-character";

export function getCharacter(id: string | null | undefined) {
  return CHARACTERS.find((character) => character.id === id) ?? CHARACTERS[0];
}
