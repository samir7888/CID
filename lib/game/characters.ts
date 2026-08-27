export interface CharacterDefinition {
  id: string;
  name: string;
  role: string;
  description: string;
  unlockCost: number;
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
    unlockCost: 0,
  },
  {
    id: "girl",
    name: "BYDD SHYTT",
    role: "NEW RECRUIT",
    description:
      "A new lund sa chamakta chera with phool se mehekti badd shytt.",
    unlockCost: 50,
    modelPath: "/models/girl.glb",
    modelScale: 0.92,
    modelYOffset: 0.8,
  },
  {
    id: "modi",
    name: "MODI JI",
    role: "SPECIAL BJP OPERATIVE",
    description: "A determined melody paglu.",
    unlockCost: 100,
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
