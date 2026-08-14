"use client"

import * as THREE from "three"
import { getHeroFluidEngine } from "./heroFluidRegistry"

const QUAD_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const OVERLAY_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uRevealTexture;
  uniform sampler2D uDye;
  uniform vec2 uDyeUvOffset;
  uniform vec2 uDyeUvScale;
  uniform float uDyePackScale;
  uniform float uRevealSize;
  uniform float uEdgeSoftness;
  uniform float uEdgeWidth;
  varying vec2 vUv;
  void main() {
    vec2 dyeUv = vUv * uDyeUvScale + uDyeUvOffset;
    float inBounds = step(0.0, dyeUv.x) * step(dyeUv.x, 1.0) * step(0.0, dyeUv.y) * step(dyeUv.y, 1.0);
    float dye = texture2D(uDye, dyeUv).r * uDyePackScale * inBounds;
    vec4 revealColor = texture2D(uRevealTexture, vUv);
    float raw = dye * uRevealSize;
    float mask = clamp(smoothstep(uEdgeSoftness, uEdgeSoftness + uEdgeWidth, raw), 0.0, 1.0);
    gl_FragColor = vec4(revealColor.rgb, mask * revealColor.a);
  }
`

export type NavFluidOverlayOptions = {
  drawReveal: (ctx: CanvasRenderingContext2D, width: number, height: number) => void
  isSuspended: () => boolean
}

export class NavFluidOverlay {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private quad: THREE.Mesh
  private material: THREE.ShaderMaterial

  revealCanvas = document.createElement("canvas")
  private revealTexture: THREE.CanvasTexture
  private dyeTexture: THREE.DataTexture | null = null

  private drawReveal: NavFluidOverlayOptions["drawReveal"]
  private isSuspended: NavFluidOverlayOptions["isSuspended"]

  private rafId = 0
  private disposed = false

  constructor(private canvas: HTMLCanvasElement, options: NavFluidOverlayOptions) {
    this.drawReveal = options.drawReveal
    this.isSuspended = options.isSuspended

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "default",
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setClearColor(0, 0)
    this.renderer.autoClear = true

    this.revealTexture = new THREE.CanvasTexture(this.revealCanvas)
    this.revealTexture.minFilter = THREE.LinearFilter
    this.revealTexture.generateMipmaps = false

    this.material = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: QUAD_VERTEX,
      fragmentShader: OVERLAY_FRAGMENT,
      uniforms: {
        uRevealTexture: { value: this.revealTexture },
        uDye: { value: null },
        uDyeUvOffset: { value: new THREE.Vector2() },
        uDyeUvScale: { value: new THREE.Vector2(1, 1) },
        uDyePackScale: { value: 2.0 },
        uRevealSize: { value: 3.9 },
        uEdgeSoftness: { value: 0.5 },
        uEdgeWidth: { value: 0.01 },
      },
    })

    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material)
    this.scene.add(this.quad)

    this.animate = this.animate.bind(this)
    this.rafId = requestAnimationFrame(this.animate)
  }

  resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return
    this.renderer.setSize(width, height, false)
    this.rebake(width, height)
  }

  rebake(width: number, height: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.revealCanvas.width = Math.max(1, Math.round(width * dpr))
    this.revealCanvas.height = Math.max(1, Math.round(height * dpr))
    const ctx = this.revealCanvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.drawReveal(ctx, width, height)
    this.revealTexture.needsUpdate = true
  }

  private render() {
    const overlayRect = this.canvas.getBoundingClientRect()
    const hero = getHeroFluidEngine()

    if (!hero || overlayRect.width === 0 || overlayRect.height === 0) {
      this.renderer.clear()
      return
    }

    // The hero stays permanently `position: sticky` (so later sections slide up and
    // cover it), so its getBoundingClientRect() always reports as if still on screen.
    // Gate on scrollY vs its natural height instead of trusting that rect alone.
    const heroRect = hero.heroElement.getBoundingClientRect()
    const scrolledPastHero = window.scrollY >= heroRect.height
    const overlapsHero =
      !scrolledPastHero &&
      overlayRect.bottom > heroRect.top &&
      overlayRect.top < heroRect.bottom &&
      overlayRect.right > heroRect.left &&
      overlayRect.left < heroRect.right

    if (!overlapsHero) {
      this.renderer.clear()
      return
    }

    const readback = hero.engine.getDyeReadback()
    if (!this.dyeTexture || this.dyeTexture.image.width !== readback.size) {
      this.dyeTexture?.dispose()
      this.dyeTexture = new THREE.DataTexture(
        readback.data,
        readback.size,
        readback.size,
        THREE.RGBAFormat,
        THREE.UnsignedByteType,
      )
      this.dyeTexture.minFilter = THREE.LinearFilter
      this.dyeTexture.magFilter = THREE.LinearFilter
      this.dyeTexture.wrapS = THREE.ClampToEdgeWrapping
      this.dyeTexture.wrapT = THREE.ClampToEdgeWrapping
    }
    this.dyeTexture.needsUpdate = true

    const scaleX = overlayRect.width / heroRect.width
    const scaleY = overlayRect.height / heroRect.height
    const offsetX = (overlayRect.left - heroRect.left) / heroRect.width
    const offsetYTop = (overlayRect.top - heroRect.top) / heroRect.height
    const offsetY = 1 - offsetYTop - scaleY

    this.material.uniforms.uDye.value = this.dyeTexture
    this.material.uniforms.uDyePackScale.value = readback.packScale
    this.material.uniforms.uDyeUvScale.value.set(scaleX, scaleY)
    this.material.uniforms.uDyeUvOffset.value.set(offsetX, offsetY)

    this.renderer.clear()
    this.renderer.render(this.scene, this.camera)
  }

  private animate() {
    if (this.disposed) return
    this.rafId = requestAnimationFrame(this.animate)
    if (this.isSuspended()) {
      this.renderer.clear()
      return
    }
    this.render()
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.rafId)
    this.material.dispose()
    this.quad.geometry.dispose()
    this.revealTexture.dispose()
    this.dyeTexture?.dispose()
    this.renderer.dispose()
  }
}
