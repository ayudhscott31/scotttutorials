import * as React from 'react';
import { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from './utils';

const springConfig = { damping: 15, stiffness: 150 };

function useTiltHandlers(
  mouseX: ReturnType<typeof useMotionValue<number>>,
  mouseY: ReturnType<typeof useMotionValue<number>>,
) {
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { width, height, left, top } = rect;
    mouseX.set((e.clientX - left) / width - 0.5);
    mouseY.set((e.clientY - top) / height - 0.5);
  };

  const onPointerLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return { onPointerMove, onPointerLeave };
}

export interface InteractiveTravelCardProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  actionText: string;
  href: string;
  onActionClick: () => void;
  className?: string;
}

export const InteractiveTravelCard = React.forwardRef<
  HTMLDivElement,
  InteractiveTravelCardProps
>(
  (
    { title, subtitle, imageUrl, actionText, href, onActionClick, className },
    ref,
  ) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);
    const rotateX = useTransform(springY, [-0.5, 0.5], ['10.5deg', '-10.5deg']);
    const rotateY = useTransform(springX, [-0.5, 0.5], ['-10.5deg', '10.5deg']);
    const tilt = useTiltHandlers(mouseX, mouseY);

    return (
      <motion.div
        ref={ref}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={cn(
          'relative min-h-[26rem] w-full max-w-sm overflow-visible rounded-2xl border border-border/30 bg-transparent p-3 shadow-2xl',
          className,
        )}
      >
        <CardFrame>
          <img
            src={imageUrl}
            alt={`${title}, ${subtitle}`}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <CardContent
            title={title}
            subtitle={subtitle}
            actionText={actionText}
            href={href}
            onActionClick={onActionClick}
          />
        </CardFrame>
      </motion.div>
    );
  },
);
InteractiveTravelCard.displayName = 'InteractiveTravelCard';

export interface InteractiveVideoCardProps {
  title: string;
  subtitle: string;
  videoUrl: string;
  posterUrl: string;
  actionText?: string;
  onActionClick: () => void;
  className?: string;
}

export const InteractiveVideoCard = React.forwardRef<
  HTMLDivElement,
  InteractiveVideoCardProps
>(
  (
    {
      title,
      subtitle,
      videoUrl,
      posterUrl,
      actionText = 'Watch now',
      onActionClick,
      className,
    },
    ref,
  ) => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);
    const rotateX = useTransform(springY, [-0.5, 0.5], ['6deg', '-6deg']);
    const rotateY = useTransform(springX, [-0.5, 0.5], ['-6deg', '6deg']);
    const tilt = useTiltHandlers(mouseX, mouseY);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const el = containerRef.current;
      const video = videoRef.current;
      if (!el || !video || !videoUrl) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            void video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        },
        { threshold: 0.35 },
      );

      observer.observe(el);
      return () => observer.disconnect();
    }, [videoUrl]);

    return (
      <motion.div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className={cn(
          'relative min-h-[25rem] w-full overflow-visible rounded-2xl border border-border/30 bg-transparent p-3 shadow-2xl',
          className,
        )}
      >
        <CardFrame>
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={posterUrl || undefined}
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : posterUrl ? (
            <img
              src={posterUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-neutral-900" />
          )}
          <CardContent
            title={title}
            subtitle={subtitle}
            actionText={actionText}
            onActionClick={onActionClick}
          />
        </CardFrame>
      </motion.div>
    );
  },
);
InteractiveVideoCard.displayName = 'InteractiveVideoCard';

function CardFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ transform: 'translateZ(40px)', transformStyle: 'preserve-3d' }}
      className="relative h-[23rem] w-full overflow-hidden rounded-xl shadow-lg"
    >
      {children}
    </div>
  );
}

interface CardContentProps {
  title: string;
  subtitle: string;
  actionText: string;
  href?: string;
  onActionClick: () => void;
}

function CardContent({
  title,
  subtitle,
  actionText,
  href,
  onActionClick,
}: CardContentProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/80" />

      <div className="relative z-10 flex h-full min-h-0 flex-col justify-between px-4 pb-5 pt-4 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 pr-1">
            <motion.h2
              style={{ transform: 'translateZ(30px)' }}
              className="text-xl font-bold leading-tight line-clamp-2"
            >
              {title}
            </motion.h2>
            <motion.p
              style={{ transform: 'translateZ(20px)' }}
              className="mt-1.5 text-sm font-light text-white/85 line-clamp-2"
            >
              {subtitle}
            </motion.p>
          </div>
          {href ? (
            <motion.a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, rotate: '2.5deg' }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Learn more about ${title}`}
              style={{ transform: 'translateZ(40px)' }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-inset ring-white/30 backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <ArrowUpRight className="h-5 w-5 text-white" />
            </motion.a>
          ) : null}
        </div>

        <motion.button
          type="button"
          onClick={onActionClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ transform: 'translateZ(30px)' }}
          className={cn(
            'mt-4 w-full shrink-0 rounded-full py-3.5 text-center text-sm font-semibold text-nav-active-foreground',
            'bg-nav-active shadow-md ring-1 ring-inset ring-black/10 hover:brightness-95',
          )}
        >
          {actionText}
        </motion.button>
      </div>
    </>
  );
}
