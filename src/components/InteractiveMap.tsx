import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { RotateCw, Maximize, Minimize, SquareArrowOutUpRight } from 'lucide-react';

import * as PanzoomModule from '@panzoom/panzoom';
const Panzoom = PanzoomModule.default;
import type { PanzoomObject } from '@panzoom/panzoom';

import MapSVG from '@assets/mapppp.svg?react';
import FuzzySearch from '@/components/ui/inputs/FuzzySearch';
import ClubInfoCard from '@components/ui/cards/ClubInfoCard'
import type { ClubInfo } from '@/types/club';


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

    // const clubsDataMap = useRef(new Map(clubs.map(club => [club.mapId, club])));
    const panzoomInstanceRef = useRef<PanzoomObject | null>(null);
    const interactiveMapSvgRef = useRef<SVGSVGElement | null>(null);
    const mapDivRef = useRef<HTMLDivElement | null>(null);
    const mapViewportRef = useRef<HTMLDivElement | null>(null);

    // useEffect(() => {
    //     clubsDataMap.current = new Map(clubs.map(club => [club.mapId, club]));
    // }, [clubs]);

    const clubsDataMap = useMemo(() => {
        // console.log("重新計算 clubsDataMap...");
        return new Map(clubs.map(club => [club.mapId, club]));
    }, [clubs]);

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            const panzoomInstance = Panzoom(node, {
                minScale: 0.7,
                maxScale: 11,
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
                panzoomInstance.zoomWithWheel(e, { step: 0.4 })
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
            interactiveMapSvgRef.current = node

            const clickablePaths = node.querySelectorAll<SVGPathElement>('path[id^="club-"]');
            const handlePathClick = (event: MouseEvent) => {
                const targetPath = event.currentTarget as SVGPathElement;
                setSelectedClubId(prevId => (prevId === targetPath.id ? null : targetPath.id));
            };

            const labels: ClubLabel[] = [];
            clickablePaths.forEach(path => {
                path.addEventListener('click', handlePathClick);
                // path.addEventListener("mouseover", handlePathClick);

                const clubId = path.id;
                const clubData = clubsDataMap.get(clubId);

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
            console.log("重渲染標籤")
            setClubLabels(labels);

            return () => {
                clickablePaths.forEach(path => {
                    path.removeEventListener('click', handlePathClick);
                    // path.removeEventListener('mouseover', handlePathClick);
                });
            };
        }
    }, [clubs]);

    useEffect(() => {
        const svgRoot = interactiveMapSvgRef.current;
        if (!svgRoot) return;

        svgRoot.querySelectorAll('path.selected').forEach(p => {
            p.classList.remove('selected');
        });

        if (selectedClubId) {
            const selectedPath = document.getElementById(selectedClubId);
            if (selectedPath) {
                selectedPath.classList.add('selected');
            }
            setSelectedClubInfo(clubsDataMap.get(selectedClubId) || null)
        }
    }, [selectedClubId, clubsDataMap]);


    function toggleFullscreen() {
        const mapContainer = mapDivRef.current;
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

    const handleRotate = () => {
        const panzoom = panzoomInstanceRef.current;
        if (!panzoom) return;

        const originalScale = panzoom.getScale()
        panzoom.zoom(0.5, { animate: true, duration: 300 })
        const nextRotate = rotate + 1;
        if (selectedClubId) {
            setTimeout(() => {
                setRotate(nextRotate)
            }, 400);

            setTimeout(() => {
                zoomToClub(selectedClubId, nextRotate)
            }, 800);

        } else {
            const rawPanX = panzoom.getPan().x;
            const rawPanY = panzoom.getPan().y;

            const panX = -rawPanY;
            const panY = rawPanX;

            setTimeout(() => {
                setRotate(nextRotate)
            }, 400);

            setTimeout(() => {
                panzoom.pan(panX, panY, { animate: true, duration: 300 });
                panzoom.zoom(originalScale, { animate: true, duration: 300 })
            }, 800);
        }

    };

    const zoomToClub = (id: string, nextRotate?: number) => {
        const panzoom = panzoomInstanceRef.current;
        const svgElement = interactiveMapSvgRef.current;
        const pathElement = document.getElementById(id) as SVGGraphicsElement | null;

        if (!panzoom || !svgElement || !pathElement) return;

        const bbox = pathElement.getBBox();
        const targetX = bbox.x + bbox.width / 2;
        const targetY = bbox.y + bbox.height / 2;

        const targetScale = 6;

        const mapContainer = mapViewportRef.current;
        if (!mapContainer) return;

        const divH = mapContainer.offsetHeight;
        const divW = mapContainer.offsetWidth;

        const scale = (divW < 640 || divH < 640) ? Math.min(divH / 640, divW / 640) : 1;

        let rawPanX = (-targetX + 320) * scale;
        let rawPanY = (-targetY + 320) * scale;

        let panX = rawPanX;
        let panY = rawPanY;

        const currentRotate = nextRotate || rotate
        switch (currentRotate % 4) {
            case 0:
                break;
            case 1:
                [panX, panY] = [-rawPanY, rawPanX];
                break;
            case 2:
                [panX, panY] = [-rawPanX, -rawPanY];
                break;
            case 3:
                [panX, panY] = [rawPanY, -rawPanX];
                break;
        }

        if (divH > 400 && divW < 600) {
            panY += 10
        }
        if (divH < 400 && divW < 600) {
            panX -= 20
        }

        panzoom.zoom(1, { animate: true, duration: 500 });
        panzoom.pan(panX, panY, { animate: true, duration: 500 });
        panzoom.zoom(targetScale, { animate: true, duration: 500 });
    }

    return (
        <div className="map-wrapper mb-12">
            <div ref={mapDivRef} id='map-div' className="relative map-svg-container h-screen bg-primary-100">
                <div ref={mapViewportRef} className={`map-viewport w-full ${isFullScreen ? " h-full " : " h-[80%] md:h-[90%] "} overflow-hidden rounded-lg border-2 border-accent-400`}>
                    <div
                        ref={containerRef}
                        className="relative w-full h-full /w-[1600px] /h-[1600px] /bg-red-300/50"
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
                                        transform={`rotate(${((((rotate % 4 === 3) || (rotate % 4 === 2)) ? 2 : 0) + (isXAxis ? -1 : 0)) * 90}, ${label.x}, ${label.y})`}
                                    >
                                        {label.name}
                                    </text>)
                            }
                            )}
                        </svg>
                    </div>
                </div>
                <div className={`absolute ${isFullScreen ? " h-full " : " h-[80%] md:h-[90%] "}  right-4 top-3 md:right-6 md:top-5 w-72 md:w-[40rem] max-w-[60%] flex flex-col md:flex-row gap-2 md:gap-4 items-start pointer-events-none`}>
                    <FuzzySearch<ClubInfo>
                        items={clubs}
                        searchKeys={['name', 'summary', 'tags', 'clubCode']}
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
                        {(selectedClubId && selectedClubInfo) ? (
                            <ClubInfoCard clubInfo={selectedClubInfo} onZoomToClub={() => zoomToClub(selectedClubId!)} />
                        ) : (
                            <p>點擊地圖選擇社團。</p>
                        )}
                    </div>
                </div>
                <button onClick={handleRotate} className=" absolute left-4 top-3 md:left-6 md:top-5 shadow-brand hover:shadow-brand-md shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 map-info-panel text-black text-base bg-accent-400 focus-visible:ring-2 outline-0  ring-accent-600 rounded-md w-10 h-10 px-2 py-2">
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