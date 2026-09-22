import type { Metadata } from 'next';
import GamePage from './GamePage';

export const metadata: Metadata = {
  title: 'Play C.I.D. Game — Dodge ACP Pradyuman | Free 3D Endless Runner',
  description:
    'Play the free C.I.D. endless runner game now! Dodge obstacles, collect pink chuts, escape ACP Pradyuman in this 3D browser game. No download required — works on mobile & desktop.',
  keywords: [
    'play cid game',
    'cid game online',
    'ACP Pradyuman game play',
    'chodu cid game play',
    'free endless runner browser',
    'cid run game',
  ],
  alternates: {
    canonical: '/game',
  },
  openGraph: {
    title: 'Play C.I.D. Game Free — Run from ACP Pradyuman!',
    description:
      'Dodge obstacles and escape ACP Pradyuman in this free 3D browser endless runner. No download, no install — just run!',
    url: '/game',
  },
};

export default function Page() {
  return <GamePage />;
}
