import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import type { Club } from '@/types/club';
type ClubData = Club;

import Masonry from 'react-masonry-css';

import { X, Filter, ChevronDown } from 'lucide-react';

import type { PagefindAPI, PagefindSearchResults, PagefindResult, PagefindDocument } from '@/types/pagefind';


import { useLocalStorage } from '@/scripts/useLocalStorage';
import { clsx } from 'clsx';
import ClubCard from '@components/ui/cards/ClubCardForSearch';

interface SearchPageProps {
    allClubs: ClubData[];
}

export default function SearchPage({ allClubs }: SearchPageProps) {
    const [searchResults, setSearchResults] = useState<ClubData[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [favorites, setFavorites] = useLocalStorage<Set<string>>('favoriteClubs', new Set());
    const [selectedClub, setSelectedClub] = useState<ClubData | null>(null);

    const pagefindApi = useRef<PagefindAPI | null>(null);
    const allClubsMap = useMemo(() =>
        new Map(allClubs.map(c => [c.clubCode, c])),
        [allClubs]
    );

    useEffect(() => {
        const loadPagefind = async () => {
            if (!pagefindApi.current) {
                try {
                    // @ts-ignore
                    const pagefindModule = await import(/*@vite-ignore */ `/pagefind/pagefind.js?${Date.now()}`);
                    pagefindApi.current = pagefindModule;
                } catch (e) {
                    console.error("Failed to load Pagefind Core API:", e);
                }
            }
        };
        loadPagefind();
    }, []);

    useEffect(() => {
        const performSearch = async () => {
            const hasSearchTerm = searchQuery.trim().length > 0;
            const hasFilters = Object.values(activeFilters).some(f => f.length > 0);

            if (!hasSearchTerm && !hasFilters) {
                setIsSearching(false);
                setSearchResults([]);
                return;
            }

            setIsSearching(true);

            if (!pagefindApi.current) return;

            // `searchResult` 現在是 PagefindSearchResults 類型
            const searchResult: PagefindSearchResults = await pagefindApi.current.search(searchQuery, { filters: activeFilters });

            console.log("Raw search result:", searchResult);

            if (searchResult && searchResult.results) {
                // 1. 呼叫每個 result 的 data() 函式來獲取詳細資料
                //    Promise.all 會等待所有 data() 函式完成
                const detailedResults: PagefindDocument[] = await Promise.all(
                    searchResult.results.map(result => result.data())
                );

                console.log("Detailed results with meta:", detailedResults);

                // 2. 從詳細資料中提取 clubCode
                const clubCodes = detailedResults.map(doc => doc.meta.clubCode);

                // 3. 用 clubCode 找到完整的 ClubData
                const clubsFromSearch = clubCodes
                    .filter((code): code is string => !!code) // 過濾掉 undefined 的 code
                    .map(code => allClubsMap.get(code))
                    .filter((c): c is Club => !!c);

                setSearchResults(clubsFromSearch);
            }
        };

        const debounceTimeout = setTimeout(() => {
            performSearch();
        }, 300);

        return () => clearTimeout(debounceTimeout);
    }, [searchQuery, activeFilters, allClubsMap]);


    const clubsToDisplay = useMemo(() => {
        if (viewMode === 'favorites') {
            const favoriteClubs = allClubs.filter(club => favorites.has(club.clubCode));
            if (isSearching) {
                const searchResultCodes = new Set(searchResults.map(c => c.clubCode));
                return favoriteClubs.filter(c => searchResultCodes.has(c.clubCode));
            }
            return favoriteClubs;
        }
        return isSearching ? searchResults : allClubs;
    }, [viewMode, favorites, isSearching, searchResults, allClubs]);

    const availableFilters = useMemo(() => {
        const tags = new Set<string>();
        const members = new Set<string>();
        allClubs.forEach(club => {
            club.tags.forEach(tag => tags.add(tag));
            if (club.members?.current) members.add(club.members.current);
        });
        return {
            tags: Array.from(tags).sort(),
            members: Array.from(members).sort((a, b) => parseInt(a) - parseInt(b)),
        };
    }, [allClubs]);

    const handleToggleFavorite = useCallback((id: string) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(id)) {
                newFavorites.delete(id);
            } else {
                newFavorites.add(id);
            }
            return newFavorites;
        });
    }, [setFavorites]);

    const handleToggleFilter = useCallback((filterType: 'tag' | 'members', value: string) => {
        setActiveFilters(prev => {
            const currentValues = prev[filterType] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];

            const newFilters = { ...prev, [filterType]: newValues };

            if (newValues.length === 0) {
                delete newFilters[filterType];
            }

            return newFilters;
        });
    }, []);

    const breakpointColumnsObj = {
        default: 4,
        1280: 3,
        768: 2,
        640: 1,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <header className="mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="搜尋社團名稱、類別、編號..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-shrink-0 grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setViewMode('all')}
                            className={clsx("px-4 py-2 rounded-lg transition-colors", viewMode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200')}
                        >
                            所有社團
                        </button>
                        <button
                            onClick={() => setViewMode('favorites')}
                            className={clsx("px-4 py-2 rounded-lg transition-colors", viewMode === 'favorites' ? 'bg-blue-600 text-white' : 'bg-gray-200')}
                        >
                            我的收藏
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 text-gray-600">
                        <Filter size={16} />
                        <span>篩選條件</span>
                        <ChevronDown size={16} className={clsx("transition-transform", isFilterOpen && "rotate-180")} />
                    </button>
                    {isFilterOpen && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                            <div className="mb-4">
                                <h4 className="font-semibold mb-2">標籤</h4>
                                <div className="flex flex-wrap gap-2">
                                    {availableFilters.tags.map(tag => (
                                        <button
                                            key={tag}
                                            onClick={() => handleToggleFilter('tag', tag)}
                                            className={clsx(
                                                "px-3 py-1 text-sm rounded-full border transition-colors",
                                                activeFilters.tag?.includes(tag)
                                                    ? "bg-blue-500 border-blue-500 text-white"
                                                    : "bg-white border-gray-300"
                                            )}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <h4 className="font-semibold mb-2">人數</h4>
                                <div className="flex flex-wrap gap-2">
                                    {availableFilters.members.map(memberRange => (
                                        <button
                                            key={memberRange}
                                            onClick={() => handleToggleFilter('members', memberRange)}
                                            className={clsx(
                                                "px-3 py-1 text-sm rounded-full border transition-colors",
                                                activeFilters.members?.includes(memberRange)
                                                    ? "bg-blue-500 border-blue-500 text-white"
                                                    : "bg-white border-gray-300"
                                            )}
                                        >
                                            {memberRange}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <main>
                {clubsToDisplay.length > 0 ? (
                    <Masonry
                        breakpointCols={breakpointColumnsObj}
                        className="my-masonry-grid"
                        columnClassName="my-masonry-grid_column"
                    >
                        {clubsToDisplay.map(club => (
                            <ClubCard
                                key={club.clubCode}
                                club={club}
                                isFavorite={favorites.has(club.clubCode)}
                                onToggleFavorite={handleToggleFavorite}
                                onClick={setSelectedClub}
                            />
                        ))}
                    </Masonry>
                ) : (
                    <p className="text-center text-gray-500 py-16">找不到符合條件的社團。</p>
                )}
            </main>

            {selectedClub && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setSelectedClub(null)}
                >
                    <div
                        className="bg-white rounded-lg p-6 max-w-lg w-full m-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{selectedClub.name}</h2>
                            <button onClick={() => setSelectedClub(null)}><X /></button>
                        </div>
                        <img src={selectedClub.coverImage.src} alt={selectedClub.name} className="w-full h-48 object-cover rounded-md mb-4" />
                        <p className="mb-4">{selectedClub.summary}</p>
                        <a href={`/clubs/${selectedClub.slug}`} className="text-blue-600 hover:underline">
                            查看完整介紹 →
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}