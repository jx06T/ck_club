// src/scripts/lenis.ts
import Lenis from '@studio-freight/lenis'

const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
})

function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

export default lenis
