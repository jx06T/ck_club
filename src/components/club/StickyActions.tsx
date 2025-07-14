import { useState, useEffect } from 'react';
import { Heart, Share2, MapPin } from 'lucide-react';
import { useLocalStorage } from '@/scripts/useLocalStorage'; 
import { clsx } from 'clsx';

interface StickyActionsProps {
  clubCode: string;
  clubName: string;
}

export default function StickyActions({ clubCode, clubName }: StickyActionsProps) {
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
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('社團連結已複製到剪貼簿！');
      } catch (err) {
        console.error('Failed to copy: ', err);
        alert('複製連結失敗');
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:sticky md:top-24 md:float-right z-40 flex flex-col gap-3">
      <button
        onClick={handleToggleFavorite}
        disabled={!isClient}
        className={clsx(
          "w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
          isFavorite 
            ? "bg-red-500 text-white" 
            : "bg-white dark:bg-primary-700 text-primary-800 dark:text-primary-200 hover:bg-primary-100"
        )}
        aria-label={isFavorite ? '從收藏移除' : '加入收藏'}
      >
        <Heart fill={isFavorite ? 'currentColor' : 'none'} size={24} />
      </button>
      <button
        onClick={handleShare}
        className="w-14 h-14 rounded-full bg-white dark:bg-primary-700 text-primary-800 dark:text-primary-200 shadow-lg flex items-center justify-center hover:bg-primary-100 transition-colors"
        aria-label="分享"
      >
        <Share2 size={24} />
      </button>
       <a
        href="https://www.google.com/maps/place/臺北市立建國高級中學" // 可替換成特定社辦的地圖連結
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-white dark:bg-primary-700 text-primary-800 dark:text-primary-200 shadow-lg flex items-center justify-center hover:bg-primary-100 transition-colors"
        aria-label="地圖位置"
      >
        <MapPin size={24} />
      </a>
    </div>
  );
}