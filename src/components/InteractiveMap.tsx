import { useState, useEffect, useRef, useCallback } from 'react';

import * as PanzoomModule from '@panzoom/panzoom';
const Panzoom = PanzoomModule.default;
import type { PanzoomObject } from '@panzoom/panzoom';

import MapSVG from '@assets/mapppp.svg?react';

interface ClubInfo {
    id: string;
    name: string;
    summary: string;
    slug: string;
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
    const [panTransform, setPanTransform] = useState('');

    const clubsDataMap = useRef(new Map(clubs.map(club => [club.id, club])));
    const panzoomInstanceRef = useRef<PanzoomObject | null>(null);

    useEffect(() => {
        clubsDataMap.current = new Map(clubs.map(club => [club.id, club]));
    }, [clubs]);

    const svgRootRef = useCallback((node: SVGSVGElement | null) => {
        if (node) {
            const panzoomInstance = Panzoom(node, {
                minScale: 0.7,
                maxScale: 8,
                transformOrigin: { x: 0.5, y: 0.5 },
                canvas: true,
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
            console.log(labels)

            const handleZoom = (event: CustomEvent) => {
                const currentScale = event.detail.scale;
                const zoomThreshold = 3.5;

                if (currentScale > zoomThreshold) {
                    setIsZoomedIn(true);
                } else {
                    setIsZoomedIn(false);
                }

                setPanTransform(`translate(${event.detail.x}, ${event.detail.y}) scale(${event.detail.scale})`);
            };

            // @ts-ignore
            // node.addEventListener('panzoomzoom', handleZoom);
            node.addEventListener('panzoomchange', handleZoom);

            return () => {
                clickablePaths.forEach(path => {
                    path.removeEventListener('click', handlePathClick);
                });
                if (parentContainer) {
                    parentContainer.removeEventListener('wheel', handleWheel);
                }
                // @ts-ignore
                // node.removeEventListener('panzoomzoom', handleZoom);
                node.removeEventListener('panzoomchange', handleZoom);
                panzoomInstance.destroy();
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

    return (
        <div className="map-wrapper mb-12">
            <div className="relative map-svg-container h-screen">
                <div className="map-viewport grow-0 shrink-0 w-full h-[80%] md:h-[90%] overflow-hidden rounded-lg border-2 border-accent-400">
                    <div className="relative w-full h-full bg-accent-50">
                        <MapSVG
                            id="interactive-map-svg"
                            ref={svgRootRef}
                            className={`w-full h-full ${isZoomedIn ? 'is-zoomed-in' : ''}`}
                        />
                        <svg className="absolute inset-0 w-full h-full pointer-events-none bg-blue-500/50" viewBox="0 0 560 530">
                            <g transform={panTransform}>
                                {clubLabels.map(label => (
                                    <text
                                        key={label.id}
                                        x={label.x}
                                        y={label.y}
                                        className="club-label"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                    >
                                        {label.name}
                                    </text>
                                ))}
                            </g>
                        </svg>
                    </div>
                </div>
                <div className="absolute right-6 top-6 shadow-brand hover:shadow-brand-md shadow-black/10 transition-all duration-300 hover:-translate-y-0.5 map-info-panel text-black text-base bg-accent-400 rounded-md w-64 h-28 px-4 py-3">
                    {selectedClubInfo ? (
                        <div>
                            <h4 className="font-bold text-lg">{selectedClubInfo.name}</h4>
                            <p className="text-sm mt-1">{selectedClubInfo.summary}</p>
                            <a href={`/clubs/${selectedClubInfo.slug}`} className="text-blue-700 hover:underline text-base mt-2 block">
                                查看詳情 →
                            </a>
                        </div>
                    ) : (
                        <p>點擊地圖選擇社團。</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InteractiveMap;