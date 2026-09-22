import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Chodu CID Game — Play Free Online | Run from ACP Pradyuman',
  description:
    'Play Chodu CID game free in your browser! The ultimate 3D endless runner where ACP Pradyuman chases you through Indian streets. Dodge obstacles, collect pink chuts, unlock CID characters. No download needed!',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Chodu CID Game — Play Free Online | Run from ACP Pradyuman',
    description:
      'The ultimate free 3D endless runner game inspired by CID TV show. Dodge obstacles, collect pink chuts, unlock characters like Daya. Play in your browser now!',
    url: '/',
  },
};

const features = [
  {
    icon: '🏃',
    title: '3D Endless Runner',
    desc: 'Powered by Three.js for a stunning 3D Indian street experience right in your browser.',
  },
  {
    icon: '👮',
    title: 'ACP Pradyuman Chases You',
    desc: 'The legendary CID detective is hot on your heels. The faster you run, the harder he chases!',
  },
  {
    icon: '◆',
    title: 'Pink Chuts & Cosmetics',
    desc: 'Collect Pink Chuts during gameplay and unlock exclusive CID characters and cosmetics.',
  },
  {
    icon: '🏆',
    title: 'Leaderboard',
    desc: 'Compete globally. Sign in to save your high score and climb the CID wanted list.',
  },
  {
    icon: '📱',
    title: 'Mobile Ready',
    desc: 'Full touch-swipe support. Play on your phone, tablet, or desktop — no download required.',
  },
  {
    icon: '🎮',
    title: 'Multiple Characters',
    desc: 'Unlock Daya, ACP Pradyuman and more iconic CID characters as you progress.',
  },
];

const howToPlay = [
  { step: '01', title: 'Open the Game', desc: 'Click "Play Now" — the game loads instantly in your browser. No download, no install.' },
  { step: '02', title: 'Start Running', desc: 'Press Space, tap the screen, or click to begin your escape from ACP Pradyuman.' },
  { step: '03', title: 'Dodge Obstacles', desc: 'Swipe left/right or use arrow keys to switch lanes and dodge obstacles on the Indian street.' },
  { step: '04', title: 'Collect Pink Chuts', desc: 'Grab floating pink chuts as you run — they\'re the key currency for unlocking CID characters.' },
  { step: '05', title: 'Survive & Score', desc: 'The further you run, the higher your score. Beat your friends on the global leaderboard!' },
];

const faqs = [
  {
    q: 'What is Chodu CID game?',
    a: 'Chodu CID (C.I.D. — Chodu Investigation Department) is a free online 3D endless runner browser game inspired by the iconic Indian CID TV show. You run through chaotic Indian streets while ACP Pradyuman chases you.',
  },
  {
    q: 'Is the CID game free to play?',
    a: 'Yes! The CID endless runner is completely free to play. Just open it in your browser and start running. Optional Pink Chuts packages are available for unlocking premium characters.',
  },
  {
    q: 'Who is ACP Pradyuman in the CID game?',
    a: 'ACP Pradyuman is the iconic detective from India\'s longest-running crime show CID. In our game, he\'s the relentless pursuer chasing you down endless Indian streets. You must run and dodge to survive!',
  },
  {
    q: 'How do I unlock Daya in the CID game?',
    a: 'Daya and other CID characters can be unlocked using Pink Chuts — the in-game currency. Collect them during gameplay or purchase a Pink Chuts package from our store.',
  },
  {
    q: 'Does the CID game need a download?',
    a: 'No download needed! C.I.D. game runs entirely in your web browser. It uses WebGL and Three.js for 3D graphics. Works on Chrome, Firefox, Edge, and Safari.',
  },
  {
    q: 'Can I play CID game on mobile?',
    a: 'Absolutely! C.I.D. game supports touch controls. Swipe left and right to dodge obstacles on your smartphone or tablet. It works great on both Android and iOS.',
  },
  {
    q: 'What are Pink Chuts in the game?',
    a: 'Pink Chuts are the in-game currency for C.I.D. Game. Collect them during your runs or buy packages from our store. Use them to unlock exclusive CID characters and cosmetic items.',
  },
  {
    q: 'Do I need to sign up to play?',
    a: 'No sign-up needed to play! Create a free account only if you want to save your high score to the global leaderboard or purchase Pink Chuts to unlock premium characters.',
  },
];

export default function HomePage() {
  return (
    <main id="home" className="cid-landing">

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section id="hero" className="cid-hero" aria-label="Game hero section">
        <div className="cid-hero-glow" aria-hidden="true" />
        <div className="cid-hero-inner">
          <div className="cid-kicker">C.I.D. / RUN 01</div>
          <h1 className="cid-hero-title">
            RUN FROM<br />
            <span className="cid-hero-accent">ACP PRADYUMAN</span>
          </h1>
          <p className="cid-hero-desc">
            The legendary CID detective is chasing you through chaotic Indian streets.
            Dodge obstacles, collect pink chuts, unlock iconic characters and survive
            as long as you can in this free 3D endless runner.
          </p>
          <div className="cid-hero-actions">
            <Link
              href="/game"
              id="play-now-cta"
              className="cid-btn-primary"
              aria-label="Play C.I.D. game now"
            >
              ▶ PLAY NOW — FREE
            </Link>
            <Link
              href="#how-to-play"
              id="how-to-play-link"
              className="cid-btn-secondary"
            >
              HOW TO PLAY
            </Link>
          </div>
          <div className="cid-hero-badges">
            <span className="cid-badge">🆓 Free to Play</span>
            <span className="cid-badge">📱 Mobile Ready</span>
            <span className="cid-badge">🌐 No Download</span>
            <span className="cid-badge">🏆 Global Leaderboard</span>
          </div>
        </div>
      </section>

      {/* ─── ABOUT ────────────────────────────────────────────── */}
      <section id="about" className="cid-section" aria-labelledby="about-heading">
        <div className="cid-section-inner">
          <div className="cid-kicker">C.I.D. / ABOUT THE GAME</div>
          <h2 id="about-heading" className="cid-section-title">WHAT IS CHODU CID GAME?</h2>
          <div className="cid-about-grid">
            <div className="cid-about-text">
              <p>
                <strong>C.I.D. — Chodu Investigation Department</strong> is a free-to-play 3D
                endless runner game that brings India's most beloved crime show to your browser.
                Built with cutting-edge Three.js WebGL technology, it delivers a stunning 3D
                Indian street environment with no downloads or installations required.
              </p>
              <p>
                You play as a suspect fleeing the scene — but ACP Pradyuman, India's sharpest
                detective, is hot on your trail. Navigate chaotic Indian streets lined with
                rickshaws, chai stalls, and unexpected obstacles. The further you run, the more
                intense the chase becomes!
              </p>
              <p>
                Inspired by the iconic Sony Entertainment Television show <em>CID</em> that ran for
                over two decades, this game lets fans relive the thrill of the chase — but this
                time, you&apos;re the one running. Unlock beloved CID characters like <strong>Daya</strong>{' '}
                and collect <strong>Pink Chuts</strong> to customize your runner.
              </p>
            </div>
            <div className="cid-about-stats">
              <div className="cid-stat">
                <div className="cid-stat-value">∞</div>
                <div className="cid-stat-label">ENDLESS LEVELS</div>
              </div>
              <div className="cid-stat">
                <div className="cid-stat-value">3D</div>
                <div className="cid-stat-label">THREE.JS GRAPHICS</div>
              </div>
              <div className="cid-stat">
                <div className="cid-stat-value">0₹</div>
                <div className="cid-stat-label">FREE TO PLAY</div>
              </div>
              <div className="cid-stat">
                <div className="cid-stat-value">1</div>
                <div className="cid-stat-label">RULE: DON'T GET CAUGHT</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW TO PLAY ──────────────────────────────────────── */}
      <section id="how-to-play" className="cid-section cid-section-dark" aria-labelledby="htp-heading">
        <div className="cid-section-inner">
          <div className="cid-kicker">C.I.D. / GAMEPLAY</div>
          <h2 id="htp-heading" className="cid-section-title">HOW TO PLAY CID GAME</h2>
          <p className="cid-section-desc">
            Master the art of escape in 5 simple steps:
          </p>
          <ol className="cid-steps" aria-label="How to play steps">
            {howToPlay.map(({ step, title, desc }) => (
              <li key={step} className="cid-step">
                <div className="cid-step-num" aria-hidden="true">{step}</div>
                <div className="cid-step-content">
                  <h3 className="cid-step-title">{title}</h3>
                  <p className="cid-step-desc">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="cid-controls">
            <div className="cid-kicker" style={{ marginBottom: '16px' }}>CONTROLS</div>
            <div className="cid-controls-grid">
              <div className="cid-control-item"><kbd>←</kbd><kbd>→</kbd> Arrow Keys — Lane switch</div>
              <div className="cid-control-item"><kbd>↑</kbd> Up / Space — Jump</div>
              <div className="cid-control-item"><kbd>↓</kbd> Down — Slide</div>
              <div className="cid-control-item">👆 Swipe Left/Right — Mobile lane switch</div>
              <div className="cid-control-item">👆 Swipe Up — Mobile jump</div>
              <div className="cid-control-item">👆 Swipe Down — Mobile slide</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────── */}
      <section id="features" className="cid-section" aria-labelledby="features-heading">
        <div className="cid-section-inner">
          <div className="cid-kicker">C.I.D. / FEATURES</div>
          <h2 id="features-heading" className="cid-section-title">GAME FEATURES</h2>
          <ul className="cid-features-grid" aria-label="Game features">
            {features.map(({ icon, title, desc }) => (
              <li key={title} className="cid-feature-card">
                <div className="cid-feature-icon" aria-hidden="true">{icon}</div>
                <h3 className="cid-feature-title">{title}</h3>
                <p className="cid-feature-desc">{desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── CHARACTERS ───────────────────────────────────────── */}
      <section id="characters" className="cid-section cid-section-dark" aria-labelledby="chars-heading">
        <div className="cid-section-inner">
          <div className="cid-kicker">C.I.D. / CAST</div>
          <h2 id="chars-heading" className="cid-section-title">CID GAME CHARACTERS</h2>
          <p className="cid-section-desc">
            The iconic cast of India's favourite crime show, now in your browser game.
          </p>
          <div className="cid-chars-grid">
            <article className="cid-char-card cid-char-villain">
              <div className="cid-char-badge">PURSUER</div>
              <div className="cid-char-icon" aria-hidden="true">👮</div>
              <h3 className="cid-char-name">ACP PRADYUMAN</h3>
              <p className="cid-char-desc">
                India&apos;s sharpest detective. He has solved thousands of cases and he
                <em>will</em> catch you unless you run fast enough. His famous catchphrase
                echoes through every level: the chase never ends.
              </p>
              <div className="cid-char-tag">AVAILABLE FROM START</div>
            </article>

            <article className="cid-char-card">
              <div className="cid-char-badge">UNLOCKABLE</div>
              <div className="cid-char-icon" aria-hidden="true">💪</div>
              <h3 className="cid-char-name">DAYA</h3>
              <p className="cid-char-desc">
                ACP Pradyuman&apos;s loyal partner known for breaking down doors with bare hands.
                Unlock Daya as a playable runner character using Pink Chuts and channel his
                legendary strength on the streets.
              </p>
              <div className="cid-char-tag">UNLOCK WITH ◆ PINK CHUTS</div>
            </article>

            <article className="cid-char-card">
              <div className="cid-char-badge">MORE COMING</div>
              <div className="cid-char-icon" aria-hidden="true">🔒</div>
              <h3 className="cid-char-name">MORE CHARACTERS</h3>
              <p className="cid-char-desc">
                More beloved CID characters are being added regularly. Collect Pink Chuts now
                and be ready to unlock the entire CID squad as they drop into the game.
              </p>
              <div className="cid-char-tag">COMING SOON</div>
            </article>
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <section id="faq" className="cid-section" aria-labelledby="faq-heading">
        <div className="cid-section-inner cid-faq-inner">
          <div className="cid-kicker">C.I.D. / FAQ</div>
          <h2 id="faq-heading" className="cid-section-title">FREQUENTLY ASKED QUESTIONS</h2>
          <dl className="cid-faq-list">
            {faqs.map(({ q, a }) => (
              <div key={q} className="cid-faq-item">
                <dt className="cid-faq-q">{q}</dt>
                <dd className="cid-faq-a">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────── */}
      <section id="play-cta" className="cid-cta-section" aria-label="Play game call to action">
        <div className="cid-hero-glow" aria-hidden="true" />
        <div className="cid-cta-inner">
          <div className="cid-kicker">C.I.D. / GET STARTED</div>
          <h2 className="cid-cta-title">READY TO RUN?</h2>
          <p className="cid-cta-desc">
            ACP Pradyuman is waiting. How long can you survive the chase?
          </p>
          <Link
            href="/game"
            id="play-now-bottom-cta"
            className="cid-btn-primary cid-btn-large"
            aria-label="Start playing C.I.D. game"
          >
            ▶ START RUNNING — IT'S FREE
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <footer id="footer" className="cid-footer" role="contentinfo">
        <div className="cid-footer-inner">
          <div className="cid-footer-brand">
            <div className="cid-kicker">C.I.D.</div>
            <p className="cid-footer-tagline">Chodu Investigation Department</p>
          </div>
          <nav className="cid-footer-nav" aria-label="Footer navigation">
            <Link href="/game" id="footer-play-link" className="cid-footer-link">Play Game</Link>
            <Link href="/pink-coins" id="footer-store-link" className="cid-footer-link">Store</Link>
            <Link href="/login" id="footer-login-link" className="cid-footer-link">Sign In</Link>
            <Link href="#faq" id="footer-faq-link" className="cid-footer-link">FAQ</Link>
          </nav>
          <p className="cid-footer-copy">
            © {new Date().getFullYear()} C.I.D. Game. Fan-made. Not affiliated with Sony Entertainment Television.
          </p>
        </div>
      </footer>
    </main>
  );
}
