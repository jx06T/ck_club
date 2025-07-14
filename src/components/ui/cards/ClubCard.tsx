import { Star } from 'lucide-react';
import type { Club } from '@/types/club';
type ClubData = Club;

function ClubCard({ club, isFavorite, onToggleFavorite, onClick }: {
    club: ClubData;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
    onClick: (club: ClubData) => void;
}) {
    return (
        <div className="relative group cursor-pointer hover:scale-[1.02] transition-transform duration-300 " onClick={() => onClick(club)
        }>
            <img
                src={club.coverImage.src}
                alt={`${club.name} 封面`}
                className="w-full h-auto rounded-lg shadow-md "
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
            <div className="absolute bottom-0 left-0 p-4 text-white">
                <p className="text-xs font-semibold opacity-80">{club.clubCode}</p>
                <h3 className="text-lg font-bold">{club.name}</h3>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(club.clubCode);
                }}
                className={`absolute top-2 right-2 p-2 rounded-full bg-black/30 backdrop-blur-sm transition-colors duration-200 hover:bg-black/50 ${isFavorite ? "text-yellow-400" : "text-white"}`}
                aria-label={isFavorite ? '取消收藏' : '加入收藏'}
            >
                <Star size={20} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
        </div >
    )
}

export default ClubCard;