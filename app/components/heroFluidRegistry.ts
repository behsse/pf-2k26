"use client"

import type { FluidTextReveal } from "./fluidTextReveal"

type HeroFluidEntry = {
  engine: FluidTextReveal
  heroElement: HTMLElement
}

let activeEntry: HeroFluidEntry | null = null

export function registerHeroFluidEngine(engine: FluidTextReveal, heroElement: HTMLElement) {
  activeEntry = { engine, heroElement }
}

export function unregisterHeroFluidEngine(engine: FluidTextReveal) {
  if (activeEntry?.engine === engine) activeEntry = null
}

export function getHeroFluidEngine(): HeroFluidEntry | null {
  return activeEntry
}
