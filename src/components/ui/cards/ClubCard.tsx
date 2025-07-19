import { Star, Bookmark } from 'lucide-react';
import type { Club } from '@/types/club';
import { motion } from 'framer-motion';
type ClubData = Club;

function ClubCard({ club, isFavorite, onToggleFavorite, onClick }: {
    club: ClubData;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
    onClick: (club: ClubData) => void;
}) {
    return (
        <div className=" club-card-wrapper relative group cursor-pointer hover:scale-[1.02] transition-transform duration-300 " onClick={() => onClick(club)
        }>
            <img
                src={club.coverImage.src}
                alt={`${club.name} 封面`}
                className="w-full h-auto rounded-md shadow-md min-h-20 "
                loading="lazy"
            />
            {/* <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-md"></div> */}
            <div
                className="absolute  left-0 right-0 bottom-0 h-20 rounded-md"
                style={{
                    background: `linear-gradient(to top right,rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%)`,
                    clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
                    transition: 'all 0.3s ease-in-out'
                }}
            ></div>
            <div
                className="absolute right-0 top-0 w-14 h-14 rounded-md"
                style={{
                    background: `linear-gradient(to bottom left ,rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%)`,
                    clipPath: 'polygon(0 0 , 100% 0, 100% 100%)',
                    transition: 'all 0.3s ease-in-out'
                }}
            ></div>
            <div className="absolute bottom-0 left-0 p-3 px-3.5 text-white">
                <p className="text-xs font-semibold opacity-80">{club.clubCode}</p>
                <h3 className="text-lg font-bold">{club.name}</h3>
            </div>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(club.clubCode);
                }}
                className={`absolute top-2 right-2 p-1 rounded-full bg-transparent transition-colors duration-200 hover:bg-white/10 ${isFavorite ? "text-accent-500" : "text-white"}`}
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
        </div >
    )
}

export default ClubCard;