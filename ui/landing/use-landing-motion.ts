'use client';

import { useEffect, type RefObject } from 'react';

export function useLandingMotion(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function initialize() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const media = gsap.matchMedia();

      media.add(
        '(prefers-reduced-motion: no-preference)',
        () => {
          gsap.from('.hero-copy > *', {
            y: 24,
            opacity: 0,
            duration: 0.85,
            stagger: 0.09,
            ease: 'power4.out',
          });
          gsap.from('.hero-receipt', {
            rotation: 5,
            y: 35,
            opacity: 0,
            duration: 1.1,
            ease: 'power4.out',
            delay: 0.12,
          });
          gsap.from('.hero-confirmation', {
            x: -20,
            opacity: 0,
            duration: 0.65,
            delay: 0.6,
            ease: 'power3.out',
          });
          gsap.to('.receipt-underlay', {
            rotation: -3,
            y: 32,
            ease: 'none',
            scrollTrigger: {
              trigger: '.landing-hero',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.5,
            },
          });
        },
        root,
      );

      media.add(
        '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        () => {
          const panels = gsap.utils.toArray<HTMLElement>('.story-panel');
          const steps = gsap.utils.toArray<HTMLElement>('.story-step');
          gsap.set(panels, { autoAlpha: 0 });
          gsap.set(panels[0], { autoAlpha: 1 });
          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: steps[0],
              start: 'center center',
              endTrigger: steps[2],
              end: 'center center',
              scrub: 0.45,
            },
          });
          panels.slice(1).forEach((panel, index) => {
            timeline
              .to(panels[index], { autoAlpha: 0, y: -18, duration: 0.2 }, index)
              .fromTo(
                panel,
                { autoAlpha: 0, y: 22 },
                { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' },
                index + 0.2,
              )
              .to({}, { duration: 0.3 });
          });
          gsap.from('.story-progress', {
            scaleY: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: '.story-track',
              start: 'top center',
              end: 'bottom center',
              scrub: true,
            },
          });
        },
        root,
      );

      void document.fonts.ready.then(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });
      cleanup = () => media.revert();
    }

    void initialize();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [root]);
}
