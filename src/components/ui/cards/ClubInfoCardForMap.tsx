
import { useState } from 'react';
import { SquareArrowOutUpRight, ChevronDown, Tag } from 'lucide-react';
import type { ClubInfo } from '@/types/club';

interface ClubInfoCardProps {
    clubInfo: ClubInfo;
    onZoomToClub: (mapId: string) => void;
    onTagClick?: (tag: string) => void;
    className?: string;
}

function ClubInfoCard({
    clubInfo,
    onZoomToClub,
    onTagClick,
    className = ''
}: ClubInfoCardProps) {
    const [tagsExpanded, setTagsExpanded] = useState(false);
    const { mapId, name, summary, slug, tags, clubCode } = clubInfo;

    return (
        <div className={`p-0 flex flex-col gap-2 ${className}`}>
            <div   title={`縮放到 ${name}`} onClick={() => onZoomToClub(mapId)} className=" cursor-pointer flex justify-between items-center">
                <h4
                    className="font-bold text-xl text-black hover:text-gray-700 transition-colors"
                >
                    {name}
                </h4>
                <span className="text-sm w-10 h-10 text-center pt-2.5  rounded-full bg-primary-50 text-primary-800">{clubCode}</span>
            </div>

            <p className="text-sm text-gray-800 flex-grow">
                {summary}
            </p>

            {tags && tags.length > 0 && (
                <div className="pt-2 border-t border-accent-300/50">
                    <button
                        onClick={() => setTagsExpanded(!tagsExpanded)}
                        className="flex items-center gap-1 text-xs text-gray-800 hover:text-gray-700 w-full text-left"
                    >
                        <Tag size={14} />
                        <span>社團標籤</span>
                        <ChevronDown
                            size={16}
                            className={`ml-auto transition-transform duration-300 ${tagsExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <div
                        className="grid transition-all duration-300 ease-in-out"
                        style={{ gridTemplateRows: tagsExpanded ? '1fr' : '0fr' }}
                    >
                        <div className="overflow-hidden">
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                {tags.map(tag => (
                                    <span
                                        key={tag}
                                        onClick={() => onTagClick?.(tag)}
                                        className={`px-2 py-0.5 text-xs rounded-full bg-primary-50 text-primary-800 ${onTagClick ? 'cursor-pointer hover:bg-primary-300' : ''}`}
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <a
                href={`/clubs/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto pt-2 text-primary-600 font-semibold hover:underline text-base flex items-center gap-1"
            >
                <span>查看詳情</span>
                <SquareArrowOutUpRight size={16} />
            </a>
        </div>
    );
}

export default ClubInfoCard;