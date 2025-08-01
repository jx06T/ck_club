import { useState, useEffect } from 'react';
import { Star, Share2, MapPin, Bookmark, Heart } from 'lucide-react';
import { useLocalStorage } from '@/scripts/useLocalStorage';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LogosGoogleIcon } from '@components/ui/Icons'

import { useAuth } from '@/scripts/useAuth';
import { createDocument, deleteDocument, readDocument } from '@/firebase/services';
import { type User } from 'firebase/auth';


interface StickyActionsProps {
    clubCode: string;
    clubName: string;
    attendsExpo: boolean;
}

export default function StickyActions({ clubCode, clubName, attendsExpo }: StickyActionsProps) {
    const [favorites, setFavorites] = useLocalStorage<Set<string>>('favoriteClubs', new Set());
    const [isFavorite, setIsFavorite] = useState(false);
    const [isClient, setIsClient] = useState(false);

    const [likeCount, setLikeCount] = useState<number>(0);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [shouldShowLoginBtn, setShouldShowLoginBtn] = useState<boolean>(false);

    const { isLoggedIn, user, signIn, getIdToken, isLoading } = useAuth();

    useEffect(() => {
        setIsClient(true);
        setIsFavorite(favorites.has(clubCode));
    }, [favorites, clubCode]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const clubData = await readDocument('clubs', clubCode);
                if (clubData) {
                    setLikeCount(clubData.likeCount || 0);
                }

                if (user) {
                    const likeDocId = `${user.uid}_${clubCode}`;
                    const likeDoc = await readDocument('likes', likeDocId);
                    setIsLiked(!!likeDoc);
                } else {
                    setIsLiked(false);
                }
            } catch (error) {
                console.error("Failed to fetch initial like data:", error);
            }
        };

        if (!isLoading) {
            fetchInitialData();
        }

    }, [clubCode, user, isLoading]);

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
            title: `${clubName} | CKClubHub 建中社團資料庫`,
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

    const handleAuth = async () => {
        if (isLoggedIn) {
            console.log("已經登入");
            return;
        }

        await signIn();
    };



    const handleLike = async () => {
        if (!isLoggedIn || !user) {
            setShouldShowLoginBtn(!shouldShowLoginBtn);
            return;
        }

        const newLikedState = !isLiked;
        const originalLikeState = { isLiked, likeCount };
        // 直接從 hook 提供的 user 物件中獲取 uid
        const likeDocId = `${user.uid}_${clubCode}`;

        console.log(likeDocId)
        setIsLiked(newLikedState);
        setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);
        try {
            if (newLikedState) {
                await createDocument('likes', likeDocId, {
                    userId: user.uid,
                    clubCode: clubCode,
                    createdAt: new Date(),
                });
            } else {
                await deleteDocument('likes', likeDocId);
            }
        } catch (error) {
            console.error("Like/Unlike operation failed:", error);
            setIsLiked(originalLikeState.isLiked);
            setLikeCount(originalLikeState.likeCount);
        }
    };

    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, 70]);
    if (!isClient || isLoading) {
        return null;
    }

    return (
        <motion.div
            className="fixed top-20 right-2 sm:right-[5%] sm:top-[5.5rem] z-40 flex flex-col gap-2"
            style={{ y }}
        >
            <button
                onClick={handleToggleFavorite}
                disabled={!isClient}

                className={`w-10 h-10 rounded-full  bg-accent-300/70 shadow-md flex items-center justify-center  hover:bg-accent-200/70 transition-colors duration-300 ${isFavorite ? "text-accent-500" : "text-white"}`}
                aria-label={isFavorite ? '取消收藏' : '加入收藏'}
            >
                <motion.div
                    animate={{
                        scale: isFavorite ? [1, 1.2, 1] : [1, 1.05, 1],
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                    <Bookmark size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                </motion.div>
            </button>

            <button
                onClick={handleLike}
                disabled={!isClient}

                className={`w-10 py-2 rounded-full bg-accent-300/70 shadow-md  hover:bg-accent-200/70 transition-color duration-300 ${isLiked ? "text-[#ff3040]" : "text-white"}`}
                aria-label={isLiked ? '取消按讚' : '按讚'}
            >
                <div className=' w-full flex items-center justify-center '>
                    <motion.div
                        animate={{
                            scale: isLiked ? [1, 1.2, 1] : [1, 1.05, 1],
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                        <span className=' text-white '>{likeCount}</span>
                    </motion.div>
                </div>

                <div onClick={handleAuth} className={`w-10 h-[9rem] -mb-2 overflow-hidden my-0  bg-accent-300/70 rounded-full  ${shouldShowLoginBtn ? " max-h-96 opacity-100" : " max-h-0 opacity-0"} transition-[max-height,opacity] duration-300`}>
                    <a className='  rounded-full h-full w-full py-1'>
                        <LogosGoogleIcon className=' w-full h-5 mt-1.5 inline-block' />
                        <span style={{ writingMode: "vertical-lr" }} className=' h-28'>點擊驗證身分</span>
                    </a>
                </div>


            </button>


            <button
                onClick={handleShare}
                className="w-10 h-10 rounded-full  bg-accent-300/70 shadow-md flex items-center justify-center  hover:bg-accent-200/70 transition-colors duration-300 text-white"
                aria-label="分享"
            >
                <Share2 size={24} />
            </button>
            {attendsExpo &&
                <a
                    href={`/map?club=${clubCode}`}
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full  bg-accent-300/70 shadow-md flex items-center justify-center  hover:bg-accent-200/70 transition-colors duration-300 text-white"
                    aria-label="地圖位置"
                >
                    <MapPin size={24} />
                </a>
            }
        </motion.div >
    );
}