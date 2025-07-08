import { useRef, useEffect, useState } from 'react';
import { ChevronRight } from "lucide-react";

interface Props {
    src: string;
    poster?: string;
    ctaText: string;
    ctaLink: string;
}
interface ResponsiveSettings {
    threshold: number;
    scale: number;
}

function debounce<F extends (...args: any[]) => any>(func: F, wait: number): (...args: Parameters<F>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), wait);
    };
}
const MOBILE_BREAKPOINT = 768;

function AutoPlayVideo({ src, poster, ctaText, ctaLink }: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoDivRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showCTA, setShowCTA] = useState(false);

    const [responsiveSettings, setResponsiveSettings] = useState<ResponsiveSettings>({
        threshold: 0.9,
        scale: 1.8,
    });

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width < MOBILE_BREAKPOINT) {
                setResponsiveSettings({ threshold: 0.9, scale: 1.8 });
            } else {
                setResponsiveSettings({ threshold: 0.5, scale: 1.35 });
            }
        };

        handleResize();

        const debouncedHandleResize = debounce(handleResize, 250);
        window.addEventListener('resize', debouncedHandleResize);

        return () => {
            window.removeEventListener('resize', debouncedHandleResize);
        };
    }, []);

    useEffect(() => {
        const videoElement = videoRef.current;
        const videoDivElement = videoDivRef.current;
        if (!videoElement) return;
        if (!videoDivElement) return;

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
                threshold: responsiveSettings.threshold,
            }
        );

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('pause', handlePause);

        observer.observe(videoDivElement);

        return () => {
            if (videoElement) {
                observer.unobserve(videoElement);
                videoElement.removeEventListener('play', handlePlay);
                videoElement.removeEventListener('pause', handlePause);
            }
        };
    }, [src, responsiveSettings]);

    return (
        <section
            onClick={() => setShowCTA(!showCTA)}
            className=" py-24 px-6 sm:px-8 lg:px-10"
            ref={videoDivRef}
        >
            <div
                className=" relative w-full aspect-video rounded-lg overflow-hidden group transform transition-transform duration-700"
                style={{ transform: isPlaying ? `scale(${responsiveSettings.scale})` : "scale(1)" }}
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
    absolute inset-0 md:inset-[18%] bg-black/30 md:outline-[240px] md:outline-black/30
    flex flex-col items-center justify-center 
    transition-opacity duration-300
    ${isPlaying ? (showCTA ? 'opacity-100' : 'opacity-0 hover:opacity-100') : 'opacity-100'}
    `}
                    onClick={() => {
                        if (!showCTA) {
                            setShowCTA(true);
                        }
                    }}
                >
                    <div
                        style={{ transform: isPlaying ? `scale(${1 / responsiveSettings.scale + 0.15})` : "scale(1)" }}
                        className=' transition-transform duration-700'
                    >
                        <a
                            href={ctaLink}
                            target="_blank"
                            rel="noopener noreferrer"

                            className={` text-base 
        bg-accent-500 hover:bg-accent-600 active:bg-accent-600 text-slate-100 ring-accent-800 
        inline-block h-12 py-2.5 pl-5 pr-3 rounded-lg transition-transform duration-300 hover:scale-105
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
            </div>
        </section>
    );
};

export default AutoPlayVideo;