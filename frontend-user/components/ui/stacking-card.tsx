/**
 * @author @hopsyder
 * @organization Nexus Partners
 * @description Stacking Cards Component (Basé sur 21st.dev)
 * @created 2026-05-31
 * @updated 2026-06-04
 * 🌐 ceo.nexuspartners.xyz
 * 📧 daoudaabassichristian@gmail.com
 */

'use client';
import { ReactLenis, useLenis } from 'lenis/react';
import { useTransform, motion, useScroll, MotionValue } from 'framer-motion';
import { useRef, forwardRef } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ChevronUp, ChevronDown } from 'lucide-react';

export interface CardData {
  title: string;
  description: string;
  link?: string;
  color: string;
  url: string; // The image URL
}

interface CardProps {
  i: number;
  title: string;
  description: string;
  url: string;
  color: string;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
  link?: string;
}

const Card = ({
  i,
  title,
  description,
  url,
  color,
  progress,
  range,
  targetScale,
  link
}: CardProps) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start end', 'start start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      id={`stacking-card-${i}`}
      ref={container}
      className='h-screen flex items-center justify-center sticky top-0'
    >
      <motion.div
        style={{
          backgroundColor: color,
          scale,
          top: `calc(-5vh + ${i * 25}px)`,
        }}
        className={`flex flex-col relative -top-[20%] h-[400px] w-[85%] max-w-2xl rounded-3xl p-8 lg:p-10 origin-top shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] border border-white/10`}
      >
        <h2 className='text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight'>{title}</h2>
        
        <div className={`flex flex-col-reverse md:flex-row h-full mt-6 gap-6 md:gap-10`}>
          <div className={`w-full md:w-[45%] relative md:top-[10%] flex flex-col justify-between`}>
            <p className='text-sm lg:text-base text-white/90 font-medium leading-relaxed'>{description}</p>
            {link && (
              <span className='flex items-center gap-2 pt-4'>
                <a
                  href={link}
                  target='_blank'
                  rel='noreferrer'
                  className='text-white font-bold hover:underline cursor-pointer flex items-center gap-1 transition-all'
                >
                  Découvrir <ArrowUpRight className="w-4 h-4" />
                </a>
              </span>
            )}
          </div>

          <div
            className={`relative w-full md:w-[55%] h-48 md:h-full rounded-2xl overflow-hidden shadow-inner bg-black/20`}
          >
            <motion.div
              className={`w-full h-full relative`}
              style={{ scale: imageScale }}
            >
              <Image 
                src={url} 
                alt={title} 
                fill
                className='absolute inset-0 w-full h-full object-cover' 
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface StackingCardsProps {
  cards: CardData[];
}

export const StackingCards = forwardRef<HTMLElement, StackingCardsProps>(({ cards }, ref) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  const handleScrollTo = (direction: 'up' | 'down') => {
    const elements = [
      document.getElementById('stacking-cards-intro'),
      ...cards.map((_, i) => document.getElementById(`stacking-card-${i}`)),
      document.getElementById('stacking-cards-footer')
    ].filter(Boolean);

    if (elements.length === 0) return;

    const scrollContainer = document.getElementById('stacking-cards-intro')?.parentElement;
    if (!scrollContainer) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    
    let currentIndex = 0;
    let minDiff = Infinity;

    elements.forEach((el, index) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const diff = Math.abs(rect.top - containerRect.top);
      if (diff < minDiff) {
        minDiff = diff;
        currentIndex = index;
      }
    });

    let targetIndex = currentIndex;
    if (direction === 'down' && currentIndex < elements.length - 1) {
      targetIndex = currentIndex + 1;
    } else if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    }

    const targetElement = elements[targetIndex];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <ReactLenis root>
      <main className='bg-transparent relative' ref={container}>
        
        {/* Navigation Arrows floating panel */}
        <div className="fixed bottom-8 left-6 z-50 flex flex-col gap-2.5">
          <button
            onClick={() => handleScrollTo('up')}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-md transition-all active:scale-95 shadow-lg group hover:border-white/30 cursor-pointer"
            aria-label="Card précédente"
          >
            <ChevronUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          </button>
          <button
            onClick={() => handleScrollTo('down')}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-md transition-all active:scale-95 shadow-lg group hover:border-white/30 cursor-pointer"
            aria-label="Card suivante"
          >
            <ChevronDown className="w-5 h-5 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
        
        {/* Intro Section */}
        <section id="stacking-cards-intro" className='text-white h-[40vh] w-full flex flex-col items-center justify-center relative overflow-hidden'>
          <div className='absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:54px_54px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]'></div>
          
          <div className="relative z-10 px-8 text-center space-y-6">
            <h1 className='text-4xl lg:text-6xl font-black tracking-tighter leading-[110%]'>
              Entrez dans le<br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Réseau EmiID
              </span>
            </h1>
            <p className="text-zinc-400 font-medium max-w-sm mx-auto">
              Défilez pour découvrir pourquoi les meilleurs nous ont choisis. 👇
            </p>
          </div>
        </section>

        {/* Cards Section */}
        <section className='w-full pb-[10vh]'>
          {cards.map((card, i) => {
            const targetScale = 1 - (cards.length - i) * 0.05;
            return (
              <Card
                key={`card_${i}`}
                i={i}
                url={card.url}
                title={card.title}
                color={card.color}
                description={card.description}
                link={card.link}
                progress={scrollYProgress}
                range={[i * 0.25, 1]}
                targetScale={targetScale}
              />
            );
          })}
        </section>

        {/* Footer spacer for scroll */}
        <footer id="stacking-cards-footer" className='h-[10vh] relative z-10 grid place-content-center'>
            <p className="text-white/20 font-bold uppercase tracking-widest text-sm">
              Connect & Lead
            </p>
        </footer>
      </main>
    </ReactLenis>
  );
});

StackingCards.displayName = 'StackingCards';
