import type { Metadata } from "next";
import GamePage from "./GamePage";

export const metadata: Metadata = {
  title: "Play — C.I.D. Endless Runner",
  description: "3D endless runner game — dodge obstacles and escape ACP Pradyuman!",
};

export default function Page() {
  return <GamePage />;
}
