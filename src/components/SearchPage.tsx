import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

import type { Club } from '@/types/club';
type ClubData = Club;

import Masonry from 'react-masonry-css';

import { X, Filter, ChevronDown, ChevronRight } from 'lucide-react';

import type { PagefindAPI, PagefindSearchResults, PagefindDocument, sub_result } from '@/types/pagefind';


import { useLocalStorage } from '@/scripts/useLocalStorage';
import { clsx } from 'clsx';

import ClubCard from '@/components/ui/cards/ClubCard';

interface ClubWithSearchContext extends ClubData {
    searchContext?: {
        excerpt: string;
        sub_results: sub_result[];
    };
}

interface SearchPageProps {
    allClubs: ClubData[];
}

function SearchPage({ allClubs }: SearchPageProps) {
    const [searchResults, setSearchResults] = useState<ClubWithSearchContext[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
    const [favorites, setFavorites] = useLocalStorage<Set<string>>('favoriteClubs', new Set());

    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);

        const params = new URLSearchParams(window.location.search);
        const q = params.get('q') || '';
        const tags = params.getAll('tag');
        const members = params.getAll('members');
        const other = params.getAll('other');

        setSearchQuery(q);
        const initialFilters: Record<string, string[]> = {};
        if (tags.length > 0) initialFilters.tag = tags;
        if (members.length > 0) initialFilters.members = members;
        if (other.length > 0) initialFilters.other = other;
        setActiveFilters(initialFilters);
    }, []);

    const [selectedClub, setSelectedClub] = useState<ClubWithSearchContext | null>(null);
    const [availableFilters, setAvailableFilters] = useState({
        tags: [] as string[],
        members: [] as string[],
        other: [] as string[],
    });

    const pagefindApi = useRef<PagefindAPI | null>(null);
    const allClubsMap = useMemo(() =>
        new Map(allClubs.map(c => [c.clubCode, c])),
        [allClubs]
    );

    const dragControls = useDragControls()

    useEffect(() => {
        const loadPagefind = async () => {
            if (!pagefindApi.current) {
                try {
                    // @ts-ignore
                    const pagefindModule = await import(/*@vite-ignore */ `/pagefind/pagefind.js?${Date.now()}`);
                    pagefindModule.init();

                    pagefindApi.current = pagefindModule;
                } catch (e) {
                    console.error("Failed to load Pagefind Core API:", e);
                }
            }
        };
        loadPagefind();
    }, []);

    useEffect(() => {
        const hasSearchTerm = searchQuery.trim().length > 0;
        const hasFilters = Object.values(activeFilters).some(f => f.length > 0);



        const debounceTimeout = setTimeout(() => {
            // 在執行搜尋前，先更新 URL
            const params = new URLSearchParams();
            if (hasSearchTerm) {
                params.set('q', searchQuery);
            }
            // 處理篩選器
            Object.entries(activeFilters).forEach(([key, values]) => {
                values.forEach(value => {
                    params.append(key, value);
                });
            });

            // 使用 history.pushState 來更新 URL 而不重新載入頁面
            // 這會創建一個新的瀏覽器歷史記錄
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.pushState({ path: newUrl }, '', newUrl);
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

                const searchResult: PagefindSearchResults = await pagefindApi.current.search((hasSearchTerm ? searchQuery : null), { filters: activeFilters });

                // console.log("Raw search result:", searchResult);

                if (searchResult && searchResult.results) {
                    // 呼叫每個 result 的 data() 函式來獲取詳細資料
                    const detailedResults: PagefindDocument[] = await Promise.all(
                        searchResult.results.map(result => result.data())
                    );

                    // console.log("Detailed results with meta:", detailedResults);

                    const clubsFromSearch: ClubWithSearchContext[] = detailedResults
                        .map(doc => {
                            const clubCode = doc.meta.clubCode as string;
                            const clubData = allClubsMap.get(clubCode);

                            if (clubData) {
                                return {
                                    ...clubData,
                                    searchContext: {
                                        excerpt: doc.excerpt,
                                        sub_results: doc.sub_results,
                                    }
                                };
                            }
                            return null;
                        })
                        .filter((c) => !!c);

                    setSearchResults(clubsFromSearch);
                } else {
                    setSearchResults([])
                }
            };

            performSearch();
        }, 300);

        return () => clearTimeout(debounceTimeout);
    }, [searchQuery, activeFilters, allClubsMap]);


    const clubsToDisplay = useMemo(() => {
        if (viewMode === 'favorites') {
            const favoriteClubs = allClubs.filter(club => favorites.has(club.clubCode));

            if (isSearching) {
                return searchResults.filter(club => favorites.has(club.clubCode));
            }
            return favoriteClubs;
        }
        return isSearching ? searchResults : allClubs;
    }, [viewMode, favorites, isSearching, searchResults, allClubs]);

    useEffect(() => {
        const updateFilters = async () => {
            if (!pagefindApi.current) return;

            try {
                const filters = await pagefindApi.current.filters();
                // console.log("filters:", filters)

                const tags = Object.keys(filters.tag || {});
                const other = Object.keys(filters.other || {});
                const members = Object.keys(filters.members || {}).sort((a, b) => parseInt(a) - parseInt(b));

                setAvailableFilters({ tags, members, other });
            } catch (e) {
                console.error("Failed to fetch filters from Pagefind:", e);
            }
        };

        updateFilters();
    }, [pagefindApi.current, allClubs]);

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

    const handleToggleFilter = useCallback((filterType: 'other' | 'tag' | 'members', value: string) => {
        setActiveFilters(prev => {
            const currentValues = prev[filterType] || [];
            let newValues;

            if (filterType === "members") {
                newValues = currentValues.includes(value) ? [] : [value]
            } else {
                newValues = currentValues.includes(value)
                    ? currentValues.filter(v => v !== value)
                    : [...currentValues, value];
            }

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
        <>
            <div className={clsx("container mx-auto mb-10 bg-primary-50 rounded-md overflow-hidden transition-all  duration-300 ", isClient ? "h-0" : "h-[70vh]")}>
                <div className="loader mx-auto mt-[30vh]"></div>
            </div >
            <div className={` -mt-20 container mx-auto mb-10 ${isClient ? " opacity-100 " : " opacity-0 "}`}>
                <div className="mb-8">
                    <div className=" w-full grid grid-cols-2 gap-2 mb-6">
                        <button
                            onClick={() => setViewMode('all')}
                            className={clsx("px-4 py-2 transition-colors border-b ", viewMode === 'all' ? 'border-accent-600 text-accent-600' : 'border-primary-300 dark:border-primary-500 text-neutral-700')}
                        >
                            所有社團
                        </button>
                        <button
                            onClick={() => setViewMode('favorites')}
                            className={clsx("px-4 py-2 transition-colors border-b ", viewMode === 'favorites' ? 'border-accent-600 text-accent-600' : 'border-primary-300 dark:border-primary-500 text-neutral-700')}
                        >
                            我的收藏
                        </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="搜尋社團名稱、類別、編號..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-primary-50  rounded-lg focus:ring-1 focus:ring-accent-500 outline-0"
                        />

                    </div>

                    <div className="mt-4">
                        <div className=' flex justify-between'>
                            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 text-neutral-600">
                                <Filter size={16} />
                                <span>篩選條件</span>
                                <ChevronDown size={16} className={clsx("transition-transform", isFilterOpen && "rotate-180")} />
                            </button>
                            <span className=' text-neutral-600 text-sm inline-block mt-1'>已應用 {(activeFilters.tag || []).length} + {(activeFilters.members || []).length + (activeFilters.other || []).length} 個標籤，共有 {clubsToDisplay.length} 筆結果</span>
                        </div>

                        <div className={`mt-4  bg-primary-50 text-neutral-900 rounded-md overflow-hidden transition-[max-height] duration-500 ${isFilterOpen ? " max-h-[200vh] " : " max-h-0"}`}>
                            <div className=' w-full h-full p-4'>
                                <div className="mb-5">
                                    <div>
                                        <h4 className="font-semibold mb-2 w-fit inline-block mr-2">標籤</h4>
                                        <span className=' text-xs text-neutral-700 inline-block mr-2'>此標籤為社團自行勾選</span>
                                        <button onClick={() => setActiveFilters({ ...activeFilters, tag: [] })} className=' cursor-pointer  /bg-primary-200 border border-primary-300 px-1.5  rounded-md text-neutral-700 text-sm'>清除</button>
                                    </div>
                                    <div className="overflow-x-auto relative mt-2" >
                                        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-0 z-10 " style={{ boxShadow: "0 0 15px 15px var(--color-primary-50)" }}></div>
                                        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-0 z-10 " style={{ boxShadow: "0 0 15px 15px var(--color-primary-50)" }}></div>
                                        <div

                                            onWheel={(e) => {
                                                e.stopPropagation()
                                            }}
                                            className="grid auto-cols-max gap-y-2 gap-x-3 no-scrollbar px-2"
                                            style={{
                                                display: 'grid',
                                                gridAutoFlow: 'column',
                                                gridTemplateRows: 'repeat(5, min-content)',
                                                overflowY: 'hidden',
                                            }}
                                        >
                                            {availableFilters.tags.map((tag, i) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => handleToggleFilter('tag', tag)}
                                                    style={{ gridRowStart: (i % 5) + 1 }}
                                                    className={clsx(
                                                        "px-3 py-1 text-sm rounded-full border transition-colors whitespace-nowrap w-fit",
                                                        activeFilters.tag?.includes(tag)
                                                            ? "dark:bg-accent-700 bg-accent-600/90 border-accent-300 text-neutral-50"
                                                            : "dark:bg-primary-700 bg-primary-200 border-primary-100 text-neutral-50"
                                                    )}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <div>
                                        <h4 className="font-semibold mb-2 w-fit inline-block mr-2">人數</h4>
                                        <span className=' text-xs text-neutral-700 inline-block'>此為去年上學期該社團人數，由各社團自行填寫</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3 px-3 mt-1">
                                        {availableFilters.members.map(memberRange => (
                                            <button
                                                key={memberRange}
                                                onClick={() => handleToggleFilter('members', memberRange)}
                                                className={clsx(
                                                    "px-3 py-1 text-sm rounded-full border transition-colors",
                                                    activeFilters.members?.includes(memberRange)
                                                        ? "dark:bg-accent-700 bg-accent-600/90 border-accent-300 text-neutral-50"
                                                        : "dark:bg-primary-700 bg-primary-200 border-primary-100 text-neutral-50"
                                                )}
                                            >
                                                {memberRange}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <h4 className="font-semibold mb-2 w-fit inline-block mr-2">其他</h4>
                                    <div className="flex flex-wrap gap-3 px-3 mt-1">
                                        {availableFilters.other.map(ot => (
                                            <button
                                                key={ot}
                                                onClick={() => handleToggleFilter('other', ot)}
                                                className={clsx(
                                                    "px-3 py-1 text-sm rounded-full border transition-colors",
                                                    activeFilters.other?.includes(ot)
                                                        ? "dark:bg-accent-700 bg-accent-600/90 border-accent-300 text-neutral-50"
                                                        : "dark:bg-primary-700 bg-primary-200 border-primary-100 text-neutral-50"
                                                )}
                                            >
                                                {ot}
                                            </button>
                                        ))}
                                    </div>
                                    <span className=' text-xs text-neutral-700 inline-block'>*可地社代表該社團歡迎沒有在選社系統選中該社團之學生參與該社團活動</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <main>
                    {clubsToDisplay.length > 0 ? (
                        <Masonry
                            breakpointCols={breakpointColumnsObj}
                            className="my-masonry-grid"
                            columnClassName="my-masonry-grid_column"
                        >
                            {clubsToDisplay.map(club => (
                                <motion.div
                                    key={club.clubCode}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                >
                                    <ClubCard
                                        club={club}
                                        isFavorite={isClient ? favorites.has(club.clubCode) : false}
                                        onToggleFavorite={handleToggleFavorite}
                                        onClick={setSelectedClub}
                                    />
                                </motion.div>
                            ))}
                        </Masonry>
                    ) : (
                        <p className="text-center text-gray-500 py-16">找不到符合條件的社團。</p>
                    )}
                </main>

                <AnimatePresence>
                    {selectedClub && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="fixed inset-0 bg-black/30 flex items-end justify-center z-50"
                            onClick={() => setSelectedClub(null)}
                        >
                            <motion.div
                                initial={{ y: "100%" }}
                                animate={{ y: "0%" }}
                                exit={{ y: "100%" }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="bg-primary-50 w-full max-w-2xl rounded-t-2xl shadow-2xl px-5 pt-0  pb-12 /h-[40rem] !overflow-y-scroll no-scrollbar"
                                onClick={(e) => e.stopPropagation()}

                                drag="y"
                                dragControls={dragControls}
                                dragListener={false}
                                dragConstraints={{ top: 0, bottom: 500 }}
                                onDragEnd={(event, info) => {
                                    if (info.offset.y > 100) {
                                        setSelectedClub(null);
                                    }
                                }}
                            >
                                <div
                                    className=' h-12 p-4 /bg-red-500'
                                    onPointerDown={(e) => {
                                        dragControls.start(e)
                                    }}
                                    style={{ touchAction: 'none' }}
                                >
                                    <div className="w-12 h-1.5 bg-primary-100 rounded-full mx-auto mb-4">
                                    </div>
                                </div>

                                <div
                                    className=' w-full h-full overflow-y-auto no-scrollbar /bg-green-400'
                                >

                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-2xl font-bold">{selectedClub.name}</h2>
                                        <button onClick={() => setSelectedClub(null)} className="p-1 rounded-full hover:bg-black/10 transition-colors">
                                            <X />
                                        </button>
                                    </div>

                                    <img src={selectedClub.coverImage.src} alt={selectedClub.name} className="w-full h-48 object-cover rounded-md mb-4" />
                                    {selectedClub.searchContext ? (
                                        <>
                                            <p dangerouslySetInnerHTML={{ __html: "..." + selectedClub.searchContext.sub_results.map(e => e.excerpt).join(" ... ") + "..." }} />
                                            <p className=' mt-1'>{selectedClub.summary}</p>
                                        </>
                                    ) : (
                                        <p>{selectedClub.summary}</p>
                                    )}
                                    <a href={`/clubs/${selectedClub.slug}`} className="text-accent-800 hover:underline font-semibold">
                                        查看完整介紹
                                        <ChevronRight className=" inline-block w-5 start-3 mb-0.5" />
                                    </a>

                                </div>
                                {/* <div className=' h-[50rem]'></div> */}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div >
        </>
    );
}

export default SearchPage;