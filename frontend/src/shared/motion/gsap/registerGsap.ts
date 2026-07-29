import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

let registered = false

/**
 * Register GSAP plugins once. Import only from public scroll experiences
 * so admin/client bundles stay free of ScrollTrigger unless they pull it in.
 */
export function registerGsap(): typeof gsap {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger)
    registered = true
  }
  return gsap
}

export { gsap, ScrollTrigger }
