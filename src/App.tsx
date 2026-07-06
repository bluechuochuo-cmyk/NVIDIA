import { ArrowRight, Check } from 'lucide-react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useMemo, useRef } from 'react';

const primaryText = '#E1E0CC';
const heroVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4';
const featureVideo =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4';

const ease = [0.16, 1, 0.3, 1] as const;
const cardEase = [0.22, 1, 0.36, 1] as const;

type StyledSegment = {
  text: string;
  className?: string;
};

function WordsPullUp({
  text,
  className = '',
  showAsterisk = false,
  align = 'left',
}: {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  align?: 'left' | 'center';
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const words = useMemo(() => text.split(' '), [text]);

  return (
    <span
      ref={ref}
      className={`inline-flex flex-wrap overflow-visible ${
        align === 'center' ? 'justify-center' : 'justify-start'
      } ${className}`}
    >
      {words.map((word, index) => {
        const isLast = index === words.length - 1;
        return (
          <span
            className={`inline-block pr-[0.12em] ${
              showAsterisk && isLast ? 'overflow-visible' : 'overflow-hidden'
            }`}
            key={`${word}-${index}`}
          >
            <motion.span
              className="inline-block"
              initial={{ y: 20 }}
              animate={isInView ? { y: 0 } : { y: 20 }}
              transition={{ duration: 1, delay: index * 0.08, ease }}
            >
              {showAsterisk && isLast ? (
                <span className="relative inline-block">
                  {word}
                  <span className="absolute -right-[0.3em] top-[0.65em] text-[0.31em] leading-none">
                    *
                  </span>
                </span>
              ) : (
                word
              )}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

function WordsPullUpMultiStyle({
  segments,
  className = '',
  align = 'center',
}: {
  segments: StyledSegment[];
  className?: string;
  align?: 'left' | 'center';
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' });
  const words = useMemo(
    () =>
      segments.flatMap((segment) =>
        segment.text.split(' ').filter(Boolean).map((word) => ({
          word,
          className: segment.className || '',
        })),
      ),
    [segments],
  );

  return (
    <div
      ref={ref}
      className={`inline-flex flex-wrap gap-x-[0.18em] ${
        align === 'center' ? 'justify-center' : 'justify-start'
      } ${className}`}
    >
      {words.map((item, index) => (
        <span className="inline-block overflow-hidden pb-[0.06em]" key={`${item.word}-${index}`}>
          <motion.span
            className={`inline-block ${item.className}`}
            initial={{ y: 20 }}
            animate={isInView ? { y: 0 } : { y: 20 }}
            transition={{ duration: 0.95, delay: index * 0.08, ease }}
          >
            {item.word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}

function AnimatedLetter({
  char,
  progress,
  index,
  total,
}: {
  char: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
}) {
  const charProgress = total <= 1 ? 1 : index / total;
  const opacity = useTransform(
    progress,
    [Math.max(0, charProgress - 0.1), Math.min(1, charProgress + 0.05)],
    [0.22, 1],
  );

  return (
    <motion.span style={{ opacity }} className={char === ' ' ? 'inline' : 'inline-block'}>
      {char === ' ' ? '\u00A0' : char}
    </motion.span>
  );
}

function Hero() {
  return (
    <section className="relative h-screen min-h-[620px] bg-black p-4 md:p-6">
      <div className="relative h-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={heroVideo}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="noise-overlay pointer-events-none absolute inset-0 opacity-[0.7] mix-blend-overlay" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75" />
        <div className="soft-vignette pointer-events-none absolute inset-0" />

        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-b-2xl bg-black px-4 py-2 sm:gap-6 md:gap-12 md:rounded-b-3xl md:px-8 lg:gap-14">
            {['Our story', 'Collective', 'Workshops', 'Programs', 'Inquiries'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                className="whitespace-nowrap text-[10px] font-bold transition-colors sm:text-xs md:text-sm"
                style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.color = primaryText;
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)';
                }}
              >
                {item}
              </a>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-8 sm:px-8 md:px-9 md:pb-10">
          <div className="grid items-end gap-5 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-8">
              <h1
                className="text-[26vw] font-medium leading-[0.85] tracking-[-0.07em] sm:text-[24vw] md:text-[22vw] lg:text-[20vw] xl:text-[19vw] 2xl:text-[20vw]"
                style={{ color: primaryText }}
              >
                <WordsPullUp text="Prisma" showAsterisk />
              </h1>
            </div>
            <div className="flex max-w-[430px] flex-col items-start gap-6 md:col-span-4 md:mb-7 md:gap-7">
              <motion.p
                className="text-xs font-bold leading-[1.2] text-primary/70 sm:text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease }}
              >
                Prisma is a worldwide network of visual artists, filmmakers and storytellers bound
                not by place, status or labels but by passion and hunger to unlock potential through
                our unique perspectives.
              </motion.p>
              <motion.a
                href="#features"
                className="group inline-flex items-center gap-2 rounded-full bg-primary py-2 pl-6 pr-2 text-sm font-bold text-black transition-[gap,transform] duration-300 hover:gap-3 sm:text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7, ease }}
              >
                Join the lab
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-primary transition-transform duration-300 group-hover:scale-110 sm:h-10 sm:w-10">
                  <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                </span>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
  const ref = useRef<HTMLDivElement | null>(null);
  const bodyText =
    'Over the last seven years, I have worked with Parallax, a Berlin-based production house that crafts cinema, series, and Noir Studio in Paris. Together, we have created work that has earned international acclaim at several major festivals.';
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });
  const chars = useMemo(() => bodyText.split(''), [bodyText]);

  return (
    <section id="our-story" className="bg-black px-5 py-24 sm:px-8 md:py-32 lg:py-36">
      <div
        ref={ref}
        className="relative mx-auto flex min-h-[430px] max-w-6xl flex-col items-center justify-center bg-[#101010] px-6 py-16 text-center sm:min-h-[500px] sm:px-12 md:min-h-[620px]"
      >
        <p className="mb-5 text-[10px] font-bold text-primary sm:text-xs">Visual arts</p>
        <h2
          className="mx-auto max-w-3xl text-center text-3xl font-normal leading-[0.95] sm:text-4xl sm:leading-[0.9] md:text-5xl lg:text-6xl xl:text-7xl"
          style={{ color: primaryText }}
        >
          <WordsPullUpMultiStyle
            align="center"
            segments={[
              { text: 'I am Marcus Chen,' },
              { text: 'a self-taught director.', className: 'font-serif italic' },
              { text: 'I have skills in color grading, visual effects, and narrative design.' },
            ]}
          />
        </h2>
        <p className="mx-auto mt-10 max-w-2xl text-xs font-bold leading-[1.25] text-[#DEDBC8] sm:text-sm md:text-base">
          {chars.map((char, index) => (
            <AnimatedLetter
              char={char}
              index={index}
              total={chars.length}
              progress={scrollYProgress}
              key={`${char}-${index}`}
            />
          ))}
        </p>
      </div>
    </section>
  );
}

const featureCards = [
  {
    title: 'Project Storyboard.',
    number: '01',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85',
    items: [
      'Structure ambitious filmmaking ideas into frameworks',
      'Sequence scenes, references, and motifs',
      'Precision direction with visual purpose',
      'Keep each shot in active pursuit',
    ],
  },
  {
    title: 'Smart Critiques.',
    number: '02',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85',
    items: [
      'Receive critical notes across mood and texture',
      'Surface creative notes and recut opportunities',
      'Sync with Afterworks, Premiere, DaVinci & more',
    ],
  },
  {
    title: 'Immersion Capsule.',
    number: '03',
    image:
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85',
    items: [
      'Eliminate non-urgent noise and alerts instantly',
      'Ambient soundscapes that match, hold and fade',
      'Syncs with schedules & kit timers',
    ],
  },
];

function FeatureTextCard({
  card,
  index,
}: {
  card: (typeof featureCards)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.article
      ref={ref}
      className="flex min-h-[340px] flex-col bg-[#212121] p-5 sm:min-h-[380px] sm:p-6 lg:h-[480px]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.9, delay: index * 0.15, ease: cardEase }}
    >
      <img
        src={card.image}
        alt=""
        className="mb-9 h-10 w-10 rounded object-cover sm:h-12 sm:w-12"
        loading="lazy"
      />
      <div className="mb-auto flex items-start justify-between gap-4">
        <h3 className="text-sm font-bold text-primary/85 sm:text-base">{card.title}</h3>
        <span className="text-xs font-bold text-primary/20">{card.number}</span>
      </div>
      <ul className="mt-10 space-y-3">
        {card.items.map((item) => (
          <li className="flex gap-2 text-[11px] font-bold leading-tight text-gray-400 sm:text-xs" key={item}>
            <Check className="mt-[1px] h-3.5 w-3.5 flex-none text-primary" strokeWidth={2.4} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <a
        href="#features"
        className="mt-8 inline-flex w-fit items-center gap-2 text-xs font-bold text-primary/80 transition-colors hover:text-primary"
      >
        Learn more
        <ArrowRight className="h-3.5 w-3.5 -rotate-45" strokeWidth={2.4} />
      </a>
    </motion.article>
  );
}

function FeatureVideoCard() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.article
      ref={ref}
      className="relative min-h-[340px] overflow-hidden bg-[#212121] sm:min-h-[380px] lg:h-[480px]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.9, ease: cardEase }}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={featureVideo}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="noise-overlay pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
      <p className="absolute bottom-5 left-5 text-base font-bold sm:bottom-6 sm:left-6" style={{ color: primaryText }}>
        Your creative canvas.
      </p>
    </motion.article>
  );
}

function Features() {
  return (
    <section id="features" className="relative min-h-screen overflow-hidden bg-black px-5 py-24 sm:px-8 md:py-32">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.15]" />
      <div className="relative mx-auto max-w-7xl">
        <header className="mb-12 max-w-4xl sm:mb-16">
          <h2 className="text-xl font-bold leading-[1.1] sm:text-2xl md:text-3xl lg:text-4xl">
            <span className="block text-primary">
              <WordsPullUp
                text="Studio-grade workflows for visionary creators."
                align="left"
              />
            </span>
            <span className="block text-gray-500">
              <WordsPullUp
                text="Built for pure vision. Powered by art."
                align="left"
              />
            </span>
          </h2>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-2 md:gap-1 lg:grid-cols-4">
          <FeatureVideoCard />
          {featureCards.map((card, index) => (
            <FeatureTextCard card={card} index={index + 1} key={card.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <About />
      <Features />
    </main>
  );
}
