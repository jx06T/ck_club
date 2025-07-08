import { useState, useEffect } from 'react';

import * as PanzoomModule from '@panzoom/panzoom';
const Panzoom = PanzoomModule.default;
import type { PanzoomObject } from '@panzoom/panzoom';

import MapSVG from '@assets/mapppp.svg?react';

function InteractiveMap() {
    const [selectedClubId, setSelectedClubId] = useState<string | null>(null);


    useEffect(() => {
        const svgRoot = document.getElementById('interactive-map-svg');
        if (!svgRoot) return;

        const clickablePaths = svgRoot.querySelectorAll<SVGPathElement>('path[id^="club-"]');

        const handlePathClick = (event: MouseEvent) => {
            const targetPath = event.currentTarget as SVGPathElement;
            setSelectedClubId(prevId => (prevId === targetPath.id ? null : targetPath.id));
        };

        clickablePaths.forEach(path => {
            path.addEventListener('click', handlePathClick);
        });

        return () => {
            clickablePaths.forEach(path => {
                path.removeEventListener('click', handlePathClick);
            });
        };
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
        }
    }, [selectedClubId]);

    useEffect(() => {
        const svgElement = document.getElementById('interactive-map-svg');
        if (!svgElement) return;

        const panzoomInstance: PanzoomObject = Panzoom(svgElement, {
            minScale: 0.7,
            maxScale: 8,
            transformOrigin: { x: 0.5, y: 0.5 },
            canvas: true,
        });

        const parentContainer = svgElement.parentElement;
        if (parentContainer) {
            parentContainer.addEventListener('wheel', (e) => {
                panzoomInstance.zoomWithWheel(e)
                e.stopPropagation(); 
            });
        }

        return () => {
            if (parentContainer) {
                parentContainer.removeEventListener('wheel', panzoomInstance.zoomWithWheel);
            }
            panzoomInstance.destroy();
        };
    }, []); 

    return (
        <div className="map-wrapper mb-12">
            <div className="map-svg-container min-h-screen md:flex space-y-6 md:space-y-0 md:space-x-6">
               
                <div className="map-viewport grow-0 shrink-0 w-full md:w-[65%] h-[70%] overflow-hidden rounded-lg border-2 border-accent-400">
                    <MapSVG id="interactive-map-svg" className='w-full h-full' />
                </div>

                <div className="map-info-panel text-black text-base bg-accent-400 w-full p-6 rounded-md h-[70%]">
                    <h3>點擊地圖上的社團位置選擇社團</h3>
                    {selectedClubId ? (
                        <p>
                            <strong>{selectedClubId}</strong>
                        </p>
                    ) : (
                        <p>尚未選擇。</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InteractiveMap;