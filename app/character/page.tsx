import type { Metadata } from "next";
import CharacterSelect from "./CharacterSelect";

export const metadata: Metadata = {
    title: "Choose Character — C.I.D. Endless Runner",
    description: "Choose your field operative before the next run.",
};

export default function Page() {
    return <CharacterSelect />;
}