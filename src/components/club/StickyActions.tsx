import { useState, useEffect } from 'react';
import { Star, Share2, MapPin, Bookmark, Heart, X, Send } from 'lucide-react';
import createMsgDialog from '@components/MsgDialog';

import { useLocalStorage } from '@/scripts/useLocalStorage';
import { motion, useScroll, useTransform } from 'framer-motion';
import { LogosGoogleIcon } from '@components/ui/Icons'

import { useAuth } from '@/scripts/useAuth';
import { createDocument, deleteDocument, readDocument } from '@/firebase/services';

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

    const { isLoggedIn, user, signIn, isLoading } = useAuth();

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isShareCardLoading, setIsShareCardLoading] = useState(true);

    const [isLoadingShareImg, setIsLoadingShareImg] = useState(false)

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
                // createMsgDialog("分享失敗", "請嘗試手動複製連結", async () => {}, "了解")
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
            } catch (err) {
                console.error('Failed to copy: ', err);
                // createMsgDialog("分享失敗", "請嘗試手動複製連結", async () => {}, "了解")
            }
        }
    };

    const handleShowCard = () => {
        setIsShareCardLoading(true);
        setIsShareModalOpen(true);
    };

    async function handleShareCard() {
        setIsLoadingShareImg(true)
        const url = `/api/share-card.png?clubCode=${clubCode}&width=768`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('圖片取得失敗');
            const blob = await res.blob();
            
            const file = new File([blob], `share-card-${clubCode}.png`, { type: blob.type });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: `社團分享卡片-${clubCode}`,
                    text: window.location.href,
                });
            } else {
                console.error('您的瀏覽器環境不支援分享圖片檔案，請手動下載');
                createMsgDialog("分享失敗", "您的瀏覽器環境不支援分享圖片檔案，請嘗試直接下載圖片", async () => { }, "了解")
            }
        } catch (error) {
            console.error('分享失敗', error);
            // createMsgDialog("分享失敗", "請嘗試直接下載圖片", async () => {}, "了解")
        }
        setIsLoadingShareImg(false)
    }


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
        <>
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
                    onClick={handleShowCard}
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

            {isShareModalOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-0 left-0 bottom-0 right-0 z-50 py-4 px-2 md:px-16 lg:px-[16%] bg-black/50 backdrop-blur-xs "
                    onClick={() => setIsShareModalOpen(false)}
                >
                    <div
                        className=" p-4 relative h-full flex flex-col items-center"
                    >
                        <div onClick={(e) => e.stopPropagation()} className=' flex justify-center space-x-5 mb-3 items-center w-full'>
                            <h3 onClick={handleShareCard} className=" text-sm md:text-base cursor-pointer bg-accent-500 hover:bg-accent-400 text-gray-900 transition-colors duration-100 rounded-full pb-1 pt-1.5 text-center w-fit px-3">{isLoadingShareImg ? "請稍等..." : "分享圖片"}<Send className=' inline-block ml-1 w-4 -mt-0.5' /></h3>
                            <div className=' bg-white w-0.5 h-8 rounded-full'></div>
                            <h3 onClick={handleShare} className=" text-sm md:text-base cursor-pointer bg-accent-500 hover:bg-accent-400 text-gray-900 transition-colors duration-100 rounded-full pb-1 pt-1.5 text-center w-fit px-3">分享網址<Send className=' inline-block ml-1 w-4 -mt-0.5' /></h3>
                        </div>
                        {isShareCardLoading && (
                            <div onClick={(e) => e.stopPropagation()} className="text-white flex flex-col items-center gap-2">
                                <div className="loader mx-auto mt-[30vh]"></div>
                                <span>卡片生成中...</span>
                            </div>
                        )}
                        <img
                            src={`/api/share-card.svg?clubCode=${clubCode}`}
                            alt={`分享卡片-${clubName}`}
                            className="/hidden max-w-full w-fit max-h-[calc(100%-3rem)] object-contain object-center rounded-2xl overflow-hidden"
                            onLoad={() => setIsShareCardLoading(false)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <a
                            href={`/api/share-card.png?clubCode=${clubCode}&width=768`}
                            download={`share-card-${clubCode}.png`}
                            className="text-gray-50 underline decoration-accent-500 mt-1"
                        >
                            下載圖片
                        </a>
                        <button
                            onClick={() => setIsShareModalOpen(false)}
                            className="absolute cursor-pointer -top-0 -right-0 w-8 h-8 bg-accent-500 hover:bg-accent-400 rounded-full flex items-center justify-center text-gray-900 shadow-lg"
                            aria-label="關閉"
                        >
                            <X />
                        </button>
                    </div>
                </motion.div>
            )}
        </>
    );
}