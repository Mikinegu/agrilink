import React, { useRef, useEffect, useState } from 'react';
import heroVideo from '../assets/images/hero.mp4';
import posterImage from '../assets/images/ethiopian_farmland_sunrise_1788247696520.jpg';

interface HeroVideoPlayerProps {
  onExploreMarket?: () => void;
  onOpenRegister?: () => void;
}

export const HeroVideoPlayer: React.FC<HeroVideoPlayerProps> = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, []);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <div className="w-full h-[380px] sm:h-[480px] md:h-[540px] lg:h-[600px] relative overflow-hidden rounded-3xl sm:rounded-[2rem] border border-zinc-200/90 shadow-xl shadow-zinc-900/10 bg-black">
        {!videoError ? (
          <video
            ref={videoRef}
            src={heroVideo}
            poster={posterImage}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setVideoError(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <img
            src={posterImage}
            alt="Ethiopian Farmland Landscape"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}
      </div>
    </section>
  );
};
