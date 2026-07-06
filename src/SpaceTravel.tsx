import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';

const heroVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4';
const capabilitiesVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4';

type IconProps = {
  className?: string;
};

function ArrowUpRightIcon({ className = 'h-6 w-6' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

function PlayIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  );
}

function MaterialIcon({ path, className = 'h-6 w-6 text-white' }: IconProps & { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7 text-white"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.25 2" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7 text-white"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.2 2.35 3.35 5.18 3.35 8.5S14.2 18.15 12 20.5" />
      <path d="M12 3.5C9.8 5.85 8.65 8.68 8.65 12S9.8 18.15 12 20.5" />
    </svg>
  );
}

type FadingVideoProps = {
  src: string;
  className?: string;
  style?: React.CSSProperties;
};

function FadingVideo({ src, className = '', style = {} }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<number>(0);
  const fadingOutRef = useRef(false);
  const fadeMs = 500;
  const fadeOutLead = 0.55;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const cancelFade = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    const fadeTo = (target: number, duration: number) => {
      cancelFade();
      const from = Number.parseFloat(video.style.opacity || '0') || 0;
      const start = performance.now();

      const frame = (now: number) => {
        const raw = duration <= 0 ? 1 : (now - start) / duration;
        const t = Math.min(1, Math.max(0, raw));
        video.style.opacity = String(from + (target - from) * t);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(frame);
        } else {
          rafRef.current = 0;
        }
      };

      rafRef.current = requestAnimationFrame(frame);
    };

    const handleLoadedData = () => {
      video.style.opacity = '0';
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
      fadeTo(1, fadeMs);
    };

    const handleTimeUpdate = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const remaining = video.duration - video.currentTime;
      if (!fadingOutRef.current && remaining <= fadeOutLead && remaining > 0) {
        fadingOutRef.current = true;
        fadeTo(0, fadeMs);
      }
    };

    const handleEnded = () => {
      video.style.opacity = '0';
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
        fadingOutRef.current = false;
        fadeTo(1, fadeMs);
      }, 100);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    if (video.readyState >= 2) handleLoadedData();

    return () => {
      cancelFade();
      window.clearTimeout(timeoutRef.current);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={className}
      style={{ ...style, opacity: 0 }}
      autoPlay
      muted
      playsInline
      preload="auto"
    />
  );
}

function BlurText({
  text,
  className = '',
  delayBase = 0,
}: {
  text: string;
  className?: string;
  delayBase?: number;
}) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const reduce = useReducedMotion();
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const words = useMemo(() => text.split(' '), [text]);

  return (
    <p ref={ref} className={`flex flex-wrap justify-center gap-y-[0.1em] ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block"
          style={{ marginRight: '0.28em' }}
          initial={reduce ? false : { filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={
            reduce
              ? { opacity: 1 }
              : isInView
                ? {
                    filter: ['blur(10px)', 'blur(5px)', 'blur(0px)'],
                    opacity: [0, 0.5, 1],
                    y: [50, -5, 0],
                  }
                : { filter: 'blur(10px)', opacity: 0, y: 50 }
          }
          transition={{
            duration: 0.7,
            times: [0, 0.5, 1],
            delay: delayBase + index * 0.1,
            ease: 'easeOut',
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

function NavBar() {
  const links = ['Home', 'Voyages', 'Worlds', 'Innovation', 'Plan Launch'];

  return (
    <nav className="fixed left-0 right-0 top-4 z-50 px-8 lg:px-16">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between">
        <a
          href="#home"
          aria-label="Arcadia home"
          className="liquid-glass flex h-12 w-12 items-center justify-center rounded-full font-heading text-3xl italic leading-none text-white"
        >
          <span className="glass-content -translate-y-[2px]">a</span>
        </a>

        <div className="liquid-glass hidden items-center rounded-full px-1.5 py-1.5 lg:flex">
          <div className="glass-content flex items-center gap-1">
            {links.map((link) => (
              <a
                href={link === 'Home' ? '#home' : '#capabilities'}
                key={link}
                className="whitespace-nowrap px-3 py-2 font-body text-sm font-medium text-white/90"
              >
                {link}
              </a>
            ))}
            <a
              href="#capabilities"
              className="ml-1 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-body text-sm font-medium text-black"
            >
              Claim a Spot
              <ArrowUpRightIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="h-12 w-12" aria-hidden="true" />
      </div>
    </nav>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="liquid-glass w-full rounded-[1.25rem] p-5 sm:w-[220px]">
      <div className="glass-content flex min-h-[118px] flex-col justify-between">
        {icon}
        <div>
          <p className="font-heading text-4xl italic leading-none tracking-[-1px] text-white">
            {value}
          </p>
          <p className="mt-2 font-body text-xs font-light text-white">{label}</p>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const reveal = (delay: number) => ({
    initial: reduce ? false : { filter: 'blur(10px)', opacity: 0, y: 20 },
    animate: { filter: 'blur(0px)', opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: 'easeOut' as const },
  });

  return (
    <section id="home" className="relative min-h-[100dvh] overflow-hidden bg-black">
      <FadingVideo
        src={heroVideo}
        className="absolute left-1/2 top-0 z-0 -translate-x-1/2 object-cover object-top"
        style={{ width: '120%', height: '120%' }}
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        <NavBar />

        <div className="flex flex-1 flex-col items-center justify-center px-4 pt-24 text-center">
          <motion.div {...reveal(0.4)} className="liquid-glass rounded-full">
            <div className="glass-content flex items-center gap-2 px-1.5 py-1.5">
              <span className="rounded-full bg-white px-3 py-1 font-body text-xs font-semibold text-black">
                New
              </span>
              <span className="pr-3 font-body text-sm text-white/90">
                Maiden Crewed Voyage to Mars Arrives 2026
              </span>
            </div>
          </motion.div>

          <BlurText
            text="Venture Past Our Sky Across the Universe"
            delayBase={0.55}
            className="mt-5 max-w-2xl font-heading text-6xl italic leading-[0.82] tracking-[-4px] text-white md:text-7xl lg:text-[5.5rem]"
          />

          <motion.p
            {...reveal(0.8)}
            className="mt-4 max-w-2xl font-body text-sm font-light leading-tight text-white md:text-base"
          >
            Discover the universe in ways once unimaginable. Our pioneering vessels and
            breakthrough engineering bring deep-space exploration within reach, secure and
            extraordinary.
          </motion.p>

          <motion.div
            {...reveal(1.1)}
            className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:gap-6"
          >
            <a
              href="#capabilities"
              className="liquid-glass-strong rounded-full px-5 py-2.5 font-body text-sm font-medium text-white"
            >
              <span className="glass-content inline-flex items-center gap-2">
                Start Your Voyage
                <ArrowUpRightIcon className="h-5 w-5" />
              </span>
            </a>
            <a
              href="#capabilities"
              className="inline-flex items-center gap-2 font-body text-sm font-medium text-white"
            >
              View Liftoff
              <PlayIcon className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            {...reveal(1.3)}
            className="mt-8 grid w-full max-w-[460px] grid-cols-1 items-stretch gap-4 sm:grid-cols-2"
          >
            <StatCard icon={<ClockIcon />} value="34.5 Min" label="Average Videos Watch Time" />
            <StatCard icon={<GlobeIcon />} value="2.8B+" label="Users Across the Globe" />
          </motion.div>
        </div>

        <motion.div
          {...reveal(1.4)}
          className="flex flex-col items-center gap-4 px-4 pb-8 text-center"
        >
          <div className="liquid-glass rounded-full px-3.5 py-1">
            <span className="glass-content font-body text-xs font-medium text-white">
              Collaborating with top aerospace pioneers globally
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-2 font-heading text-2xl italic tracking-tight text-white md:gap-x-16 md:text-3xl">
            {['Aeon', 'Vela', 'Apex', 'Orbit', 'Zeno'].map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const capabilityCards = [
  {
    title: 'AI Scenery',
    iconPath:
      'M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z',
    tags: ['Natural Context', 'Photo Realism', 'Infinite Settings', 'Eco-Vibe'],
    body:
      'AI analyzes your product to create indistinguishable natural environments, from Icelandic cliffs to misty forests.',
  },
  {
    title: 'Batch Production',
    iconPath:
      'M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z',
    tags: ['Scale Fast', 'Visual Consistency', 'Time Saver', 'Ready to Post'],
    body:
      'Style your entire product line in minutes. Create a unified visual identity for catalogues and social media without weeks of retouching.',
  },
  {
    title: 'Smart Lighting',
    iconPath:
      'M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z',
    tags: ['Ray Tracing', 'Physical Shadows', 'Studio Quality', 'Sunlight Sync'],
    body:
      'Automatic lighting and material adjustment. Achieve flawless integration with realistic shadows and sunlight.',
  },
];

function CapabilityCard({
  card,
  index,
}: {
  card: (typeof capabilityCards)[number];
  index: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      className="liquid-glass flex min-h-[360px] flex-col rounded-[1.25rem] p-6"
      initial={reduce ? false : { opacity: 0, y: 24, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.75, delay: index * 0.12, ease: 'easeOut' }}
    >
      <div className="glass-content flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="liquid-glass flex h-11 w-11 flex-none items-center justify-center rounded-[0.75rem]">
            <span className="glass-content">
              <MaterialIcon path={card.iconPath} />
            </span>
          </div>
          <div className="flex max-w-[70%] flex-wrap justify-end gap-1.5">
            {card.tags.map((tag) => (
              <span
                className="liquid-glass rounded-full px-3 py-1 font-body text-[11px] text-white/90"
                key={tag}
              >
                <span className="glass-content whitespace-nowrap">{tag}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <div className="mt-6">
          <h3 className="pb-1 font-heading text-3xl italic leading-[1.1] tracking-[-1px] text-white md:text-4xl">
            {card.title}
          </h3>
          <p className="mt-3 max-w-[32ch] font-body text-sm font-light leading-snug text-white/90">
            {card.body}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

function Capabilities() {
  const reduce = useReducedMotion();
  const reveal = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24, filter: 'blur(10px)' },
    whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
    viewport: { once: true, amount: 0.25 },
    transition: { duration: 0.8, delay, ease: 'easeOut' as const },
  });

  return (
    <section id="capabilities" className="relative min-h-[100dvh] overflow-hidden bg-black">
      <FadingVideo
        src={capabilitiesVideo}
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col px-8 pb-10 pt-24 md:px-16 lg:px-20">
        <header className="mb-auto">
          <motion.p {...reveal(0.1)} className="mb-6 font-body text-sm text-white/80">
            // Capabilities
          </motion.p>
          <motion.h2
            {...reveal(0.25)}
            className="pb-2 font-heading text-6xl italic leading-[0.9] tracking-[-3px] text-white md:text-7xl lg:text-[6rem]"
          >
            Production
            <br />
            evolved
          </motion.h2>
        </header>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {capabilityCards.map((card, index) => (
            <CapabilityCard card={card} index={index} key={card.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SpaceTravel() {
  return (
    <main className="bg-black text-white">
      <Hero />
      <Capabilities />
    </main>
  );
}
