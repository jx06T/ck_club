import { useState, useEffect } from 'react';
import { Star, Share2, MapPin } from 'lucide-react';
import { useLocalStorage } from '@/scripts/useLocalStorage';
<<<<<<< HEAD
=======
import { motion, useScroll, useTransform } from 'framer-motion';
>>>>>>> master

interface StickyActionsProps {
    clubCode: string;
    clubName: string;
    attendsExpo: boolean;
}

export default function StickyActions({ clubCode, clubName, attendsExpo }: StickyActionsProps) {
    const [favorites, setFavorites] = useLocalStorage<Set<string>>('favoriteClubs', new Set());
    const [isFavorite, setIsFavorite] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setIsFavorite(favorites.has(clubCode));
    }, [favorites, clubCode]);

    const handleToggleFavorite = () => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(clubCode)) {
                newFavorites.delete(clubCode);
            } else {
                newFavorites.add(clubCode);
            }
            return newFavorites;
        });
    };

    const handleShare = async () => {
        const shareData = {
            title: `${clubName} | CKClubHub`,
            text: `來看看建中 ${clubName} 的介紹！`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        }
    };

    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, 70]);

    return (
        <motion.div
            className="fixed top-20 right-2 sm:right-[5%] sm:top-[5.5rem] z-40 flex flex-col gap-2"
            style={{ y }}
        >
            <button
                onClick={handleToggleFavorite}
                disabled={!isClient}

                className={`w-10 h-10 rounded-full  bg-accent-300/70 shadow-md flex items-center justify-center hover:scale-105 hover:bg-accent-200/70 transition-colors ${isFavorite ? "text-accent-500" : "text-white"}`}
                aria-label={isFavorite ? '取消收藏' : '加入收藏'}
            >
                <motion.div
                    animate={{
                        scale: isFavorite ? [1, 2, 1] : 1,
                        rotate: isFavorite ? [0, 10, 0] : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    <Star size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </motion.div>
            </button>

            <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full  bg-accent-300/70 shadow-md flex items-center justify-center hover:scale-105 hover:bg-accent-200/70 transition-colors text-white"
                aria-label="分享"
            >
                <Share2 size={24} />
            </button>
            {attendsExpo &&
                <a
                    href={`/map?club=${clubCode}`}
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full  bg-accent-300/70 shadow-md flex items-center justify-center hover:scale-105 hover:bg-accent-200/70 transition-colors text-white"
                    aria-label="地圖位置"
                >
                    <MapPin size={24} />
                </a>
            }
        </motion.div >
    );
}