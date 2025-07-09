import { useState, useEffect, useRef, useCallback } from 'react';

import { RotateCw, Maximize, Minimize, SquareArrowOutUpRight } from 'lucide-react';

import * as PanzoomModule from '@panzoom/panzoom';
const Panzoom = PanzoomModule.default;
import type { PanzoomObject } from '@panzoom/panzoom';

import MapSVG from '@assets/mapppp.svg?react';
import FuzzySearch from '@/components/ui/inputs/FuzzySearch';

interface ClubInfo {
    mapId: string;
    clubId: string;
    name: string;
    summary: string;
    slug: string;
    tags?: string[];
}

interface ClubLabel {
    id: string;
    name: string;
    x: number;
    y: number;
}

interface InteractiveMapProps {
    clubs: ClubInfo[];
}

function InteractiveMap({ clubs }: InteractiveMapProps) {
    const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
    const [selectedClubInfo, setSelectedClubInfo] = useState<ClubInfo | null>(null);
    const [isZoomedIn, setIsZoomedIn] = useState(false);
    const [clubLabels, setClubLabels] = useState<ClubLabel[]>([]);
    const [rotate, setRotate] = useState<number>(0);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

    const clubsDataMap = useRef(new Map(clubs.map(club => [club.mapId, club])));
    const panzoomInstanceRef = useRef<PanzoomObject | null>(null);

    useEffect(() => {
        clubsDataMap.current = new Map(clubs.map(club => [club.mapId, club]));
    }, [clubs]);

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            const panzoomInstance = Panzoom(node, {
                minScale: 0.7,
                maxScale: 10,
                transformOrigin: { x: 0.5, y: 0.5 },
                canvas: true,
                step: 1.5,
            });
            panzoomInstanceRef.current = panzoomInstance;

            setTimeout(() => {
                panzoomInstance.zoom(2.5, { animate: true, duration: 1000 })
                panzoomInstance.pan(70, 20, { animate: true, duration: 1000 })
            }, 100);

            const parentContainer = node.parentElement;
            const handleWheel = (e: WheelEvent) => {
                panzoomInstance.zoomWithWheel(e)
                e.stopPropagation();
            };

            if (parentContainer) {
                parentContainer.addEventListener('wheel', handleWheel);
            }

            const handleZoom = (event: CustomEvent) => {
                const currentScale = event.detail.scale;
                const zoomThreshold = 2.5;

                if (currentScale > zoomThreshold) {
                    setIsZoomedIn(true);
                } else {
                    setIsZoomedIn(false);
                }
            };

            // @ts-ignore
            node.addEventListener('panzoomchange', handleZoom);

            return () => {
                if (parentContainer) {
                    parentContainer.removeEventListener('wheel', handleWheel);
                }
                // @ts-ignore
                node.removeEventListener('panzoomchange', handleZoom);
                panzoomInstance.destroy();
            };
        }
    }, []);

    const svgRootRef = useCallback((node: SVGSVGElement | null) => {
        if (node) {
            const clickablePaths = node.querySelectorAll<SVGPathElement>('path[id^="club-"]');
            const handlePathClick = (event: MouseEvent) => {
                const targetPath = event.currentTarget as SVGPathElement;
                setSelectedClubId(prevId => (prevId === targetPath.id ? null : targetPath.id));
            };

            const labels: ClubLabel[] = [];
            clickablePaths.forEach(path => {
                path.addEventListener('click', handlePathClick);

                const clubId = path.id;
                const clubData = clubsDataMap.current.get(clubId);

                if (clubData) {
                    const bbox = path.getBBox();
                    const x = bbox.x + bbox.width / 2;
                    const y = bbox.y + bbox.height / 2;

                    labels.push({
                        id: clubId,
                        name: clubData.name,
                        x,
                        y
                    });
                }
            });

            setClubLabels(labels);

            return () => {
                clickablePaths.forEach(path => {
                    path.removeEventListener('click', handlePathClick);
                });
            };
        }
    }, []);

    useEffect(() => {
        const svgRoot = document.getElementById('interactive-map-svg');
        if (!svgRoot) return;

        svgRoot.querySelectorAll('path.selected').forEach(p => {
            p.classList.remove('selected');
        });

        if (selectedClubId) {
            const selectedPath = document.getElementById(selectedClubId);
            if (selectedPath) {
                selectedPath.classList.add('selected');
            }
            setSelectedClubInfo(clubsDataMap.current.get(selectedClubId) || null)
        }
    }, [selectedClubId]);


    function toggleFullscreen() {
        const mapContainer = document.getElementById('map-div');
        if (!mapContainer) return;
        setIsFullScreen(!isFullScreen)
        if (!document.fullscreenElement) {
            mapContainer.requestFullscreen().catch(err => {
                console.error(`全螢幕失敗：${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    const handleSelectClubFromSearch = (club: ClubInfo) => {
        zoomToClub(club.mapId)
        setSelectedClubId(club.mapId);
    };

    const zoomToClub = (id: string) => {
        const panzoom = panzoomInstanceRef.current;
        const svgElement = document.getElementById('interactive-map-svg');
        const pathElement = document.getElementById(id) as SVGGraphicsElement | null;

        if (!panzoom || !svgElement || !pathElement) return;

        const bbox = pathElement.getBBox();
        const targetX = bbox.x + bbox.width / 2;
        const targetY = bbox.y + bbox.height / 2;
        const targetScale = 6;

        const panX = -targetX + 320;
        const panY = -targetY + 320;

        panzoom.zoom(1, { animate: true, duration: 500 });
        panzoom.pan(panX, panY, { animate: true, duration: 500 });
        panzoom.zoom(targetScale, { animate: true, duration: 500 });
    }

    return (
        <div className="map-wrapper mb-12">
            <div id='map-div' className="relative map-svg-container h-screen bg-primary-100">
                <div className={`map-viewport w-full ${isFullScreen ? " h-full " : " h-[80%] md:h-[90%] "} overflow-hidden rounded-lg border-2 border-accent-400`}>
                    <div
                        ref={containerRef}
                        className="relative w-full h-full"
                    >
                        <MapSVG
                            id="interactive-map-svg"
                            ref={svgRootRef}
                            className={`w-full h-full transition-transform duration-300 `}
                            style={{ rotate: rotate * 90 + "deg" }}
                        />
                        <svg
                            id="interactive-map-label-svg"
                            style={{ rotate: rotate * 90 + "deg" }}
                            className={`absolute inset-0 w-full h-full pointer-events-none ${isZoomedIn ? 'is-zoomed-in' : ''} transition-transform duration-300`}
                            viewBox="0 0 640 640"
                        >
                            {clubLabels.map(label => {
                                const isXAxis = label.id.startsWith('club-x-');
                                return (
                                    <text
                                        key={
                                            label.id
                                        }
                                        x={label.x}
                                        y={label.y}
                                        className="club-label"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        transform={isXAxis ? `rotate(-90, ${label.x}, ${label.y})` : undefined}
                                    >
                                        {label.name}
                                    </text>)
                            }
                            )}
                        </svg>
                    </div>
                </div>
                <div className={`absolute ${isFullScreen ? " h-full " : " h-[80%] md:h-[90%] "}  right-4 top-3 md:right-6 md:top-5 w-72 md:w-[40rem] max-w-[60%] flex flex-col md:flex-row gap-4 items-start pointer-events-none`}>
                    <FuzzySearch<ClubInfo>
                        items={clubs}
                        searchKeys={['name', 'summary', 'tags', 'clubId']}
                        onSelect={handleSelectClubFromSearch}
                        placeholder="搜尋社團名稱或簡介..."
                        className="  md:flex-1 pointer-events-auto"
                        displayRender={(club) => (
                            <>
                                <p className="text-black">{club.name}</p>
                                <p className="text-xs text-gray-700 truncate">{club.summary}</p>
                            </>
                        )}
                    />

                    <div className="h-fit w-full pointer-events-auto md:flex-1 shadow-brand shadow-black/10 map-info-panel text-black text-base bg-accent-400 rounded-md px-4 py-2 transition-colors duration-300">
                        {selectedClubInfo ? (
                            <div>
                                <h4 className="font-bold text-lg cursor-pointer" onClick={() => zoomToClub(selectedClubId!)}>{selectedClubInfo.name}</h4>
                                <p className="text-sm mt-1 ">{selectedClubInfo.summary}</p>
                                <a href={`/clubs/${selectedClubInfo.slug}`} className="text-primary-600 fon text-base mt-2 block">
                                    查看詳情 <SquareArrowOutUpRight className=" inline-block w-4 mb-0.5" />
                                </a>
                            </div>
                        ) : (
                            <p>點擊地圖選擇社團。</p>
                        )}
                    </div>
                </div>
                <button onClick={() => setRotate(rotate + 1)} className=" absolute left-4 top-3 md:left-6 md:top-5 shadow-brand hover:shadow-brand-md shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 map-info-panel text-black text-base bg-accent-400 focus-visible:ring-2 outline-0  ring-accent-600 rounded-md w-10 h-10 px-2 py-2">
                    <RotateCw />
                </button>
                <button onClick={toggleFullscreen} className=" hidden md:block absolute left-[4.1rem] top-3 md:left-[4.6rem] md:top-5 shadow-brand hover:shadow-brand-md shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 map-info-panel text-black text-base bg-accent-400 focus-visible:ring-2 outline-0  ring-accent-600 rounded-md w-10 h-10 px-2 py-2">
                    {isFullScreen
                        ? <Minimize />
                        : <Maximize />
                    }
                </button>

            </div>
        </div >
    );
}

export default InteractiveMap;