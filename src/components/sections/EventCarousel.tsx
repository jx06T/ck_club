import { useState, useEffect, Fragment, useRef } from 'react';
import type { ImageMetadata } from "astro";
import { Calendar, SquareArrowOutUpRight } from "lucide-react"

export interface Slide {
    image: ImageMetadata;
    caption: string;
    gradientStart: string;
    gradientEnd: string;
    date: Date;
    link: string;
}

interface Props {
    slides: Slide[];
    id: string;
}

function EventCarousel({ id, slides }: Props) {
    const extendedSlides = [slides[slides.length - 1], ...slides, slides[0]];

    const [currentIndex, setCurrentIndex] = useState(1);
    const [isTransitionDisabled, setIsTransitionDisabled] = useState(false);
    const isAnimating = useRef(false);

    const goToPrevious = () => {
        if (isAnimating.current) return;

        isAnimating.current = true;
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? extendedSlides.length - 2 : currentIndex - 1;

        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        if (isAnimating.current) return;

        isAnimating.current = true;
        const isLastSlide = currentIndex === extendedSlides.length - 1;
        const newIndex = isLastSlide ? 1 : currentIndex + 1;

        setCurrentIndex(newIndex);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            goToNext();
        }, 4000);

        return () => clearInterval(timer);
    }, [currentIndex]);

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

    return (
        <div className=' mt-10 mb-20'>
            <h1 id={id} className='block text-balance text-2xl font-bold tracking-tight'>近期活動</h1>
            <div
                style={{
                    height: 'min(56.25vw, 80dvh)'
                }}
                className="relative w-full mx-auto  bg-primary-50 mt-7 ">
                <div
                    className=" pointer-events-none absolute top-0 left-0 w-full h-full rounded-md bg-transparent z-10"
                    style={{
                        boxShadow: `
                    10px 5px 20px 5px ${extendedSlides[currentIndex].gradientStart}40,
                    -10px -5px 20px 15px ${extendedSlides[currentIndex].gradientEnd}40,
                    10px 5px 20px 20px ${extendedSlides[currentIndex].gradientStart}40,
                    -10px -5px 20px 30px ${extendedSlides[currentIndex].gradientEnd}40,
                    inset 10px 5px 20px 5px ${extendedSlides[currentIndex].gradientEnd}40,
                    inset -10px -5px 20px 5px ${extendedSlides[currentIndex].gradientStart}40`,
                        transition: "box-shadow 1s ease",
                    }}
                >
                </div>
                <div className=" absolute -bottom-4 lg:-bottom-5 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                    {slides.map((_, index) => {
                        const realIndex = index + 1;
                        const isActive = currentIndex === realIndex || (realIndex === 1 && currentIndex === extendedSlides.length - 1) || (realIndex === extendedSlides.length - 2 && currentIndex === 0);
                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentIndex(realIndex);
                                }}
                                className={` ${isActive ? "w-4 md:w-6" : "w-2 md:w-2.5"} h-2 md:h-2.5 rounded-full transition-all duration-300 bg-white/70`}
                            />
                        );
                    })}
                </div>
                <div className=" h-full overflow-hidden rounded-md">
                    <div
                        className="flex h-full "
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                            transition: isTransitionDisabled ? 'none' : 'transform 0.5s ease-in-out',
                        }}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {extendedSlides.map((slide, index) => (
                            <div key={index} className=" relative w-full flex-shrink-0 h-full">
                                <img src={slide.image.src} alt={slide.caption} className="w-full h-full object-cover" />
                                <div style={{
                                    clipPath: 'polygon(100% 0, 100% 100%, 0 100%)'
                                }} className=' bg-accent-300 absolute bottom-0 right-0 h-10 w-12'>
                                    <a target='_blank' href={slide.link}>
                                        <SquareArrowOutUpRight className=' inline-block ml-7 mt-3.5 w-4' />
                                    </a>
                                </div>

                                <div style={{
                                    background: `linear-gradient(to bottom right,rgba(0,0,0,0.4) 0%, ${slide.gradientStart}bb 50%)`,
                                    clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                                }} className=' absolute top-0 left-0 h-[30%] w-[55%]'>
                                </div>

                                <div className=' overflow-visible p-2.5 pt-2 absolute top-0 left-0 h-[30%] w-[55%]  rounded-br-md '>
                                    <p className=' text-white font-normal text-xs sm:text-base md:text-lg lg:text-xl'> {slide.caption}</p>
                                    <p className=' text-primary-50 font-normal text-[0.625rem] sm:text-sm md:text-base lg:text-lg'> <Calendar className=' inline-block mb-0.5 mr-1 w-3 md:w-4 md:mb-1' />{slide.date.toISOString().split('T')[0]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                <button onClick={goToPrevious} className="text-base md:text-xl lg:text-2xl p-1 md:p-2 pb-2 md:pb-3 absolute top-1/2 -left-2 lg:-left-4 -translate-y-1/2 bg-white/20 rounded-full backdrop-blur-xs ">‹</button>
                <button onClick={goToNext} className="text-base md:text-xl lg:text-2xl p-1 md:p-2 pb-2 md:pb-3 absolute top-1/2 -right-2 lg:-right-4 -translate-y-1/2 bg-white/20 rounded-full backdrop-blur-xs ">›</button>
            </div >
        </div >
    );
};

export default EventCarousel;