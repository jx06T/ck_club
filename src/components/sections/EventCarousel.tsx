import { useState, useEffect, useRef } from 'react';
import { Calendar, SquareArrowOutUpRight, ChevronRight, ChevronLeft } from "lucide-react"

export interface Slide {
    image: { src: string };
    caption: string;
    gradientStart: string;
    gradientEnd: string;
    date: Date;
    link: string;
    organizer: string;
    description: string;
}

interface Props {
    slides: Slide[];
    id: string;
}

function EventCarousel({ id, slides }: Props) {
    const extendedSlides = [slides[slides.length - 1], ...slides, slides[0]];

    const [currentIndex, setCurrentIndex] = useState(1);
    const [isTransitionDisabled, setIsTransitionDisabled] = useState(false);
    const [expandedSlide, setExpandedSlide] = useState<number | null>(null);
    const isAnimating = useRef(false);

    const goToPrevious = () => {
        if (isAnimating.current) return;

        isAnimating.current = true;
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? extendedSlides.length - 2 : currentIndex - 1;

        setCurrentIndex(newIndex);
        setExpandedSlide(null);
    };

    const goToNext = () => {
        if (isAnimating.current) return;

        isAnimating.current = true;
        const isLastSlide = currentIndex === extendedSlides.length - 1;
        const newIndex = isLastSlide ? 1 : currentIndex + 1;

        setCurrentIndex(newIndex);
        setExpandedSlide(null);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            if (expandedSlide === null) {
                goToNext();
            }
        }, 3500);

        return () => clearInterval(timer);
    }, [currentIndex, expandedSlide]);

    const handleTransitionEnd = () => {
        setTimeout(() => {
            isAnimating.current = false;
        }, 50);
        if (isTransitionDisabled) {
            return
        }
        if (currentIndex === 0) {
            setCurrentIndex(extendedSlides.length - 2);
            setIsTransitionDisabled(true);
        }

        else if (currentIndex === extendedSlides.length - 1) {
            setCurrentIndex(1);
            setIsTransitionDisabled(true);
        }
    };

    useEffect(() => {
        if (isTransitionDisabled) {
            const timeout = setTimeout(() => {
                setIsTransitionDisabled(false);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [isTransitionDisabled]);

    const toggleExpanded = (slideIndex: number) => {
        setExpandedSlide(expandedSlide === slideIndex ? null : slideIndex);
    };

    return (
        <section className='pt-6 pb-16'>
            <h1 id={id} className='block text-balance text-3xl font-bold tracking-tight'>近期活動</h1>
            <div
                style={{
                    height: 'min(56.25vw, 80dvh)'
                }}
                className="relative w-full mx-auto bg-primary-50 mt-7"
            >
                <div
                    className="pointer-events-none absolute top-0 left-0 w-full h-full rounded-md bg-transparent z-10"
                    style={{
                        boxShadow: `
                    10px 5px 15px 5px ${extendedSlides[currentIndex].gradientStart}40,
                    -10px -5px 15px 15px ${extendedSlides[currentIndex].gradientEnd}40,
                    10px 5px 15px 20px ${extendedSlides[currentIndex].gradientStart}40,
                    -10px -5px 15px 30px ${extendedSlides[currentIndex].gradientEnd}40`,
                        transition: "box-shadow 1s ease",
                    }}
                >
                </div>

                <div className="absolute -bottom-4 lg:-bottom-5 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                    {slides.map((_, index) => {
                        const realIndex = index + 1;
                        const isActive = currentIndex === realIndex || (realIndex === 1 && currentIndex === extendedSlides.length - 1) || (realIndex === extendedSlides.length - 2 && currentIndex === 0);
                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentIndex(realIndex);
                                    setExpandedSlide(null);
                                }}
                                className={`${isActive ? "w-4 md:w-6" : "w-2 md:w-2.5"} h-2 md:h-2.5 rounded-full transition-all duration-300 bg-white/70`}
                            />
                        );
                    })}
                </div>

                <button onClick={goToNext} className=' w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12  text-white/70  absolute top-1/2 -right-5 sm:-right-7 md:-right-8 lg:-right-10 -translate-y-1/2 rounded-full z-20'><ChevronRight className=' stroke-[2.5] w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12' /></button>
                <button onClick={goToPrevious} className=' w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12  text-white/70  absolute top-1/2 -left-5 sm:-left-7 md:-left-8 lg:-left-10 -translate-y-1/2 rounded-full z-20'><ChevronLeft className=' stroke-[2.5] w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12' /></button>

                <div className="h-full overflow-hidden rounded-md">
                    <div
                        className="flex h-full"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                            transition: isTransitionDisabled ? 'none' : 'transform 0.5s ease-in-out',
                        }}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {extendedSlides.map((slide, index) => (
                            <div
                                key={index}
                                className="relative w-full flex-shrink-0 h-full"
                                onClick={() => {
                                    const selection = window.getSelection();
                                    const isSelecting = selection && selection.toString().length > 0;
                                    if (isSelecting) {
                                        return
                                    }

                                    toggleExpanded(index);
                                }}
                            >
                                <img src={slide.image.src} alt={slide.caption} className="w-full h-full object-cover" />

                                {/* <div style={{
                                    clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                                }} className='bg-accent-300 absolute bottom-0 right-0 h-10 w-12 z-30'>
                                    <a target='_blank' href={slide.link}>
                                        <SquareArrowOutUpRight className='inline-block ml-7 mt-3.5 w-4' />
                                    </a>
                                </div> */}

                                <div
                                    style={{
                                        background: `linear-gradient(to bottom right,rgba(0,0,0,0.5) 0%, ${slide.gradientStart}bb 50%)`,
                                        clipPath: expandedSlide === index ? 'polygon(0 0, 100% 0, 0 100%)' : 'polygon(0 0, 100% 0, 0 100%)',
                                        transition: 'all 0.3s ease-in-out'
                                    }}
                                    className={`absolute top-0 left-0 z-20 ${expandedSlide === index ? 'h-[200%] w-[200%]  backdrop-blur-xs' : 'h-[30%] w-[55%]'
                                        }`}
                                />

                                <div className={` overflow-visible p-4 pt-3 absolute top-0 left-0 z-30 rounded-br-md transition-all duration-300 ${expandedSlide === index ? 'h-[100%] w-[70%] ' : 'h-[30%] w-[55%]'}`}>

                                    <div className="">
                                        <h2 className='  text-white font-normal text-xs sm:text-base md:text-lg lg:text-xl'>{slide.caption}</h2>
                                        <p className='text-slate-300 font-normal text-2xs sm:text-sm md:text-base lg:text-lg mt-1'>
                                            <Calendar className='inline-block mb-0.5 mr-1 w-3 md:w-4 md:mb-1' />
                                            {slide.date.toISOString().split('T')[0]}
                                        </p>
                                    </div>

                                    {expandedSlide === index && (
                                        <div className="mt-1 md:mt-3 lg:mt-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                                            <div className=" space-y-2 md:space-y-3">
                                                <div>
                                                    <p className="text-white/90 font-medium text-xs md:text-base lg:text-lg mb-0 md:mb-1">主辦單位</p>
                                                    <p className="text-slate-300 text-2xs md:text-sm lg:text-base ">{slide.organizer}</p>
                                                </div>
                                                <div>
                                                    <p className="text-white/90 font-medium text-xs md:text-base lg:text-lg mb-0 md:mb-1">活動說明</p>
                                                    <p className="text-slate-300 text-2xs md:text-sm lg:text-base  leading-relaxed">{slide.description}</p>
                                                </div>
                                                <div className="">
                                                    <a
                                                        href={slide.link}
                                                        target="_blank"
                                                        className="inline-flex items-center text-accent-300 hover:text-accent-400 transition-colors text-xs md:text-base lg:text-lg "
                                                    >
                                                        了解更多 <SquareArrowOutUpRight className="ml-1 w-4 inline-block mt-0.5" />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
export default EventCarousel;