import { useRef, useEffect, useState } from 'react';
import { ChevronRight } from "lucide-react";

interface Props {
    src: string;
    poster?: string;
    ctaText: string;
    ctaLink: string;
}

function AutoPlayVideo({ src, poster, ctaText, ctaLink }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showCTA, setShowCTA] = useState(false);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    videoElement.play().catch(error => {
                        console.error("Video autoplay failed:", error);
                    });
                } else {
                    videoElement.pause();
                    setShowCTA(false)
                }
            },
            {
                threshold: 0.7,
            }
        );

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('pause', handlePause);

        observer.observe(videoElement);

        return () => {
            if (videoElement) {
                observer.unobserve(videoElement);
                videoElement.removeEventListener('play', handlePlay);
                videoElement.removeEventListener('pause', handlePause);
            }
        };
    }, [src]);

    return (
        <div
            onClick={() => setShowCTA(!showCTA)}
            className="relative w-full aspect-video rounded-lg overflow-hidden group mt-36 mb-36 transform duration-500"
            style={{ transform: isPlaying ? "scale(1.2)" : "scale(1)" }}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
            />

            <div
                className={`
    absolute inset-0 bg-black/40 
    flex flex-col items-center justify-center 
    transition-opacity duration-300
    ${isPlaying ? (showCTA ? 'opacity-100' : 'opacity-0 group-hover:opacity-100') : 'opacity-100'}
    `}
                onClick={() => {
                    if (!showCTA) {
                        setShowCTA(true);
                    }
                }}
            >
                <a
                    href={ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={` text-base 
        bg-accent-500 hover:bg-accent-600 active:bg-accent-600 text-slate-100 ring-accent-800 
        py-2.5 pl-5 pr-3 rounded-lg transition-transform duration-300 hover:scale-105
        ${(!showCTA && isPlaying) ? 'pointer-events-none group-hover:pointer-events-auto' : ''}
        `}
                    onClick={(e) => e.stopPropagation()}
                >
                    <span className="inline-block align-middle mb-0.5">
                        {ctaText}
                    </span>
                    <span className="inline-block align-middle">
                        <ChevronRight />
                    </span>
                </a>
            </div>
        </div>
    );
};

export default AutoPlayVideo;