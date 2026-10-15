import React, { useRef, useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

export type AmbientScene = 'morning-mist' | 'botanical-sunlight' | 'calm-lake' | 'twilight-sanctuary';

interface AmbientVideoProps {
  scene?: AmbientScene;
  overlayGradient?: string;
  poster?: string;
  className?: string;
  children?: React.ReactNode;
}

export const AmbientVideo: React.FC<AmbientVideoProps> = ({
  scene = 'morning-mist',
  overlayGradient,
  poster = '/src/assets/images/nature_misty_mountain_lake_1792066034905.jpg',
  className = '',
  children,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  // Pause canvas when out of viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Ambient fluid light canvas simulation
  useEffect(() => {
    if (prefersReducedMotion || !isVisible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes for atmospheric drifting mist / botanical light rays
    const particleCount = 28;
    const particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 80 + 40,
      vx: (Math.random() - 0.45) * 0.25,
      vy: (Math.random() - 0.5) * 0.15,
      alpha: Math.random() * 0.18 + 0.05,
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      // Light ray / soft caustic gradient
      const rayX = width * (0.5 + Math.sin(time * 0.4) * 0.15);
      const gradient = ctx.createRadialGradient(rayX, height * 0.2, 20, rayX, height * 0.5, width * 0.7);

      if (scene === 'botanical-sunlight') {
        gradient.addColorStop(0, 'rgba(244, 221, 208, 0.14)'); // soft peach sunlight
        gradient.addColorStop(0.5, 'rgba(226, 241, 230, 0.08)'); // soft mint
        gradient.addColorStop(1, 'rgba(16, 47, 39, 0)');
      } else if (scene === 'calm-lake') {
        gradient.addColorStop(0, 'rgba(169, 199, 178, 0.16)'); // sage green reflection
        gradient.addColorStop(0.6, 'rgba(23, 76, 60, 0.06)');
        gradient.addColorStop(1, 'rgba(16, 47, 39, 0)');
      } else {
        // morning-mist default
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
        gradient.addColorStop(0.5, 'rgba(226, 241, 230, 0.09)');
        gradient.addColorStop(1, 'rgba(16, 47, 39, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Drifting atmospheric mist nodes
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.radius) p.x = width + p.radius;
        if (p.x > width + p.radius) p.x = -p.radius;
        if (p.y < -p.radius) p.y = height + p.radius;
        if (p.y > height + p.radius) p.y = -p.radius;

        const currentAlpha = p.alpha * (0.7 + Math.sin(time + p.phase) * 0.3);
        const pGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        pGrad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha})`);
        pGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [prefersReducedMotion, isVisible, scene]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {/* High-fidelity Nature Poster Image */}
      <img
        src={poster}
        alt="Tranquil landscape with morning light and pine trees"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-1000 ease-out"
        referrerPolicy="no-referrer"
        loading="eager"
      />

      {/* Atmospheric Canvas Animation (paused when prefers-reduced-motion) */}
      {!prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-75"
          aria-hidden="true"
        />
      )}

      {/* Overlay gradient scrim ensuring WCAG AA contrast */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          overlayGradient || 'bg-gradient-to-b from-[#FAFCF9]/85 via-[#FAFCF9]/55 to-[#FAFCF9]/95'
        }`}
        aria-hidden="true"
      />

      {/* Content slot */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};

export default AmbientVideo;
