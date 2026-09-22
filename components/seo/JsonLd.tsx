/**
 * JSON-LD Structured Data Component
 * Injects WebSite, VideoGame, Organization, and FAQPage schemas
 * for maximum Google rich-result eligibility.
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://choducid2.vercel.app';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'C.I.D. Game — Chodu Investigation Department',
  url: SITE_URL,
  description:
    'Free online 3D endless runner game based on the iconic Indian CID TV show. Run from ACP Pradyuman through chaotic Indian streets!',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/game`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const videoGameSchema = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'C.I.D. — Chodu Investigation Department',
  alternateName: ['Chodu CID Game', 'CID Run Game', 'ACP Pradyuman Game'],
  description:
    'An addictive free-to-play 3D endless runner browser game inspired by the legendary Indian TV show CID. Play as a suspect fleeing from ACP Pradyuman down chaotic Indian streets — dodge obstacles, collect pink chuts, and unlock CID characters like Daya.',
  url: `${SITE_URL}/game`,
  image: `${SITE_URL}/android-chrome-512x512.png`,
  genre: ['Action', 'Endless Runner', 'Arcade'],
  applicationCategory: 'Game',
  operatingSystem: 'Web Browser',
  browserRequirements: 'Requires JavaScript. Works best in Chrome, Firefox, Edge, Safari.',
  inLanguage: 'en-IN',
  isAccessibleForFree: true,
  isFamilyFriendly: true,
  numberOfPlayers: {
    '@type': 'QuantitativeValue',
    minValue: 1,
    maxValue: 1,
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    url: `${SITE_URL}/game`,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Chodu CID Team',
    url: SITE_URL,
  },
  character: [
    {
      '@type': 'Person',
      name: 'ACP Pradyuman',
      description: 'The legendary CID detective who chases you. Avoid him at all costs!',
    },
    {
      '@type': 'Person',
      name: 'Daya',
      description: 'ACP Pradyuman\'s trusted partner. Unlockable character in C.I.D. game.',
    },
  ],
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Chodu CID Team',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/android-chrome-512x512.png`,
    width: 512,
    height: 512,
  },
  sameAs: [],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the Chodu CID game?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Chodu CID (C.I.D. — Chodu Investigation Department) is a free online 3D endless runner game inspired by the iconic Indian TV show CID. You play as a suspect running through chaotic Indian streets, dodging obstacles and collectibles while being chased by ACP Pradyuman.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I play the CID game?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To play the CID game: 1) Visit the game at /game. 2) Press or tap to start. 3) Swipe or use arrow keys to dodge obstacles and lane-switch. 4) Collect pink chuts to unlock characters. 5) Survive as long as possible to get a high score!',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the CID game free to play?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! The C.I.D. game is completely free to play in your web browser. No download required. Optional in-game Pink Chuts can be purchased to unlock premium characters and cosmetics.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who are the characters in the CID game?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The CID game features characters based on the CID TV show: ACP Pradyuman (the main chaser), Daya (unlockable character), and more. You can unlock premium characters using Pink Chuts collected during gameplay or purchased from the store.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are Pink Chuts in the CID game?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pink Chuts are the in-game currency in C.I.D. Game. Collect them during gameplay or purchase Pink Chut packages from the store. Use them to unlock premium CID characters and exclusive cosmetics.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the CID game work on mobile?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! The Chodu CID game is fully playable on mobile devices. It uses touch-swipe controls for lane switching and dodging on smartphones and tablets, as well as keyboard arrow keys on desktop.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is ACP Pradyuman doing in the CID game?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In C.I.D. Game, ACP Pradyuman chases your character down an endless Indian street. The further you run, the harder he chases. Your goal is to run as far as possible without getting caught!',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I play CID game without signing up?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, you can play the basic C.I.D. endless runner game without creating an account. Sign up is only required to save your high scores to the leaderboard or purchase Pink Chuts for premium characters.',
      },
    },
  ],
};

export default function JsonLd() {
  const schemas = [websiteSchema, videoGameSchema, organizationSchema, faqSchema];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
