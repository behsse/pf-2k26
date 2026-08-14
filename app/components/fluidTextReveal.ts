"use client"

import * as THREE from "three"

export type FluidRevealSettings = {
  simResolution: number
  dyeResolution: number
  velocityDissipation: number
  dyeDissipation: number
  pressureIterations: number
  curlStrength: number
  splatRadius: number
  splatForce: number
  revealSize: number
  edgeSoftness: number
  edgeWidth: number
}

export const DEFAULT_FLUID_SETTINGS: FluidRevealSettings = {
  simResolution: 256,
  dyeResolution: 512,
  velocityDissipation: 0.962,
  dyeDissipation: 0.988,
  pressureIterations: 20,
  curlStrength: 0,
  splatRadius: 6e-5,
  splatForce: 5900,
  revealSize: 3.9,
  edgeSoftness: 0.5,
  edgeWidth: 0.01,
}

const QUAD_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SPLAT_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uTarget;
  uniform float uAspectRatio;
  uniform vec2 uPoint;
  uniform vec3 uColor;
  uniform float uRadius;
  varying vec2 vUv;
  void main() {
    vec2 p = vUv - uPoint;
    p.x *= uAspectRatio;
    vec3 splat = exp(-dot(p, p) / uRadius) * uColor;
    vec3 base = texture2D(uTarget, vUv).xyz;
    gl_FragColor = vec4(base + splat, 1.0);
  }
`

const CURL_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform vec2 uTexelSize;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
    float R = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
    float T = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
    float B = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
    float vorticity = R - L - T + B;
    gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
  }
`

const VORTICITY_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform vec2 uTexelSize;
  uniform float uCurlStrength;
  uniform float uDt;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uCurl, vUv - vec2(uTexelSize.x, 0.0)).x;
    float R = texture2D(uCurl, vUv + vec2(uTexelSize.x, 0.0)).x;
    float T = texture2D(uCurl, vUv + vec2(0.0, uTexelSize.y)).x;
    float B = texture2D(uCurl, vUv - vec2(0.0, uTexelSize.y)).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    float len = length(force) + 0.0001;
    force = force / len * uCurlStrength * C;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity += force * uDt;
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`

const ADVECTION_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 uTexelSize;
  uniform float uDt;
  uniform float uDissipation;
  varying vec2 vUv;
  vec4 bilerp(sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st = uv / tsize - 0.5;
    vec2 iuv = floor(st);
    vec2 fuv = fract(st);
    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
  }
  void main() {
    vec2 coord = vUv - uDt * texture2D(uVelocity, vUv).xy * uTexelSize;
    gl_FragColor = uDissipation * bilerp(uSource, coord, uTexelSize);
  }
`

const DIVERGENCE_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uVelocity;
  uniform vec2 uTexelSize;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
    float R = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
    float T = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
    float B = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
    float div = 0.5 * (R - L + T - B);
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
  }
`

const PRESSURE_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  uniform vec2 uTexelSize;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
    float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
    float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
    float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
    float C = texture2D(uDivergence, vUv).x;
    float pressure = (L + R + B + T - C) * 0.25;
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
  }
`

const GRADIENT_SUBTRACT_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  uniform vec2 uTexelSize;
  varying vec2 vUv;
  void main() {
    float L = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
    float R = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
    float T = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
    float B = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity -= vec2(R - L, T - B) * 0.5;
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`

const MASK_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uRevealTexture;
  uniform sampler2D uDye;
  uniform float uRevealSize;
  uniform float uEdgeSoftness;
  uniform float uEdgeWidth;
  varying vec2 vUv;
  void main() {
    float dye = texture2D(uDye, vUv).r;
    vec4 revealColor = texture2D(uRevealTexture, vUv);
    float raw = dye * uRevealSize;
    float mask = clamp(smoothstep(uEdgeSoftness, uEdgeSoftness + uEdgeWidth, raw), 0.0, 1.0);
    gl_FragColor = vec4(revealColor.rgb, mask);
  }
`

const DYE_READBACK_SIZE = 128
const DYE_PACK_SCALE = 2.0

const DYE_COPY_FRAGMENT = /* glsl */ `
  precision highp float;
  uniform sampler2D uDye;
  uniform float uPackScale;
  varying vec2 vUv;
  void main() {
    float dye = texture2D(uDye, vUv).r;
    float packed = clamp(dye / uPackScale, 0.0, 1.0);
    gl_FragColor = vec4(packed, packed, packed, 1.0);
  }
`

type DoubleFBO = {
  read: THREE.WebGLRenderTarget
  write: THREE.WebGLRenderTarget
  swap: () => void
}

export type FluidTextRevealOptions = {
  settings?: Partial<FluidRevealSettings>
  drawReveal: (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => void
}

export class FluidTextReveal {
  private settings: FluidRevealSettings
  private renderer: THREE.WebGLRenderer
  private quadScene = new THREE.Scene()
  private quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private quad: THREE.Mesh

  private velocity: DoubleFBO
  private pressure: DoubleFBO
  private dye: DoubleFBO
  private curlRT: THREE.WebGLRenderTarget
  private divergenceRT: THREE.WebGLRenderTarget
  private dyeReadbackRT: THREE.WebGLRenderTarget
  private dyeReadbackBuffer = new Uint8Array(DYE_READBACK_SIZE * DYE_READBACK_SIZE * 4)
  private simTexelSize = new THREE.Vector2()
  private dyeTexelSize = new THREE.Vector2()

  private splatMaterial: THREE.ShaderMaterial
  private curlMaterial: THREE.ShaderMaterial
  private vorticityMaterial: THREE.ShaderMaterial
  private advectionMaterial: THREE.ShaderMaterial
  private divergenceMaterial: THREE.ShaderMaterial
  private pressureMaterial: THREE.ShaderMaterial
  private gradientSubtractMaterial: THREE.ShaderMaterial
  private maskMaterial: THREE.ShaderMaterial
  private dyeCopyMaterial: THREE.ShaderMaterial

  private revealCanvas = document.createElement("canvas")
  private revealTexture: THREE.CanvasTexture

  private drawReveal: FluidTextRevealOptions["drawReveal"]

  private pointer = { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, moved: false }
  private aspect = 1
  private rafId = 0
  private disposed = false

  constructor(private canvas: HTMLCanvasElement, options: FluidTextRevealOptions) {
    this.settings = { ...DEFAULT_FLUID_SETTINGS, ...options.settings }
    this.drawReveal = options.drawReveal

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    this.renderer.setClearColor(0, 0)
    this.renderer.autoClear = false

    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2))
    this.quadScene.add(this.quad)

    const { simResolution, dyeResolution } = this.settings
    this.velocity = this.createDoubleFBO(simResolution, simResolution, THREE.LinearFilter)
    this.pressure = this.createDoubleFBO(simResolution, simResolution, THREE.NearestFilter)
    this.dye = this.createDoubleFBO(dyeResolution, dyeResolution, THREE.LinearFilter)
    this.curlRT = this.createRT(simResolution, simResolution, THREE.NearestFilter)
    this.divergenceRT = this.createRT(simResolution, simResolution, THREE.NearestFilter)
    this.dyeReadbackRT = this.createRT(
      DYE_READBACK_SIZE,
      DYE_READBACK_SIZE,
      THREE.LinearFilter,
      THREE.UnsignedByteType,
    )
    this.simTexelSize.set(1 / simResolution, 1 / simResolution)
    this.dyeTexelSize.set(1 / dyeResolution, 1 / dyeResolution)

    this.revealTexture = new THREE.CanvasTexture(this.revealCanvas)
    this.revealTexture.minFilter = THREE.LinearFilter
    this.revealTexture.generateMipmaps = false

    this.splatMaterial = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: SPLAT_FRAGMENT,
      uniforms: {
        uTarget: { value: null },
        uAspectRatio: { value: 1 },
        uPoint: { value: new THREE.Vector2() },
        uColor: { value: new THREE.Vector3() },
        uRadius: { value: this.settings.splatRadius },
      },
    })
    this.curlMaterial = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: CURL_FRAGMENT,
      uniforms: { uVelocity: { value: null }, uTexelSize: { value: this.simTexelSize } },
    })
    this.vorticityMaterial = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: VORTICITY_FRAGMENT,
      uniforms: {
        uVelocity: { value: null },
        uCurl: { value: null },
        uTexelSize: { value: this.simTexelSize },
        uCurlStrength: { value: this.settings.curlStrength },
        uDt: { value: 0.016 },
      },
    })
    this.advectionMaterial = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: ADVECTION_FRAGMENT,
      uniforms: {
        uVelocity: { value: null },
        uSource: { value: null },
        uTexelSize: { value: this.simTexelSize },
        uDt: { value: 1 },
        uDissipation: { value: 1 },
      },
    })
    this.divergenceMaterial = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: DIVERGENCE_FRAGMENT,
      uniforms: { uVelocity: { value: null }, uTexelSize: { value: this.simTexelSize } },
    })
    this.pressureMaterial = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: PRESSURE_FRAGMENT,
      uniforms: {
        uPressure: { value: null },
        uDivergence: { value: null },
        uTexelSize: { value: this.simTexelSize },
      },
    })
    this.gradientSubtractMaterial = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: GRADIENT_SUBTRACT_FRAGMENT,
      uniforms: {
        uPressure: { value: null },
        uVelocity: { value: null },
        uTexelSize: { value: this.simTexelSize },
      },
    })
    this.maskMaterial = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: MASK_FRAGMENT,
      uniforms: {
        uRevealTexture: { value: this.revealTexture },
        uDye: { value: null },
        uRevealSize: { value: this.settings.revealSize },
        uEdgeSoftness: { value: this.settings.edgeSoftness },
        uEdgeWidth: { value: this.settings.edgeWidth },
      },
    })
    this.dyeCopyMaterial = new THREE.ShaderMaterial({
      vertexShader: QUAD_VERTEX,
      fragmentShader: DYE_COPY_FRAGMENT,
      uniforms: {
        uDye: { value: null },
        uPackScale: { value: DYE_PACK_SCALE },
      },
    })

    this.animate = this.animate.bind(this)
    this.rafId = requestAnimationFrame(this.animate)
  }

  private createRT(
    width: number,
    height: number,
    filter: THREE.MagnificationTextureFilter,
    type: THREE.TextureDataType = THREE.HalfFloatType,
  ) {
    return new THREE.WebGLRenderTarget(width, height, {
      minFilter: filter,
      magFilter: filter,
      format: THREE.RGBAFormat,
      type,
      depthBuffer: false,
      stencilBuffer: false,
    })
  }

  private createDoubleFBO(width: number, height: number, filter: THREE.MagnificationTextureFilter): DoubleFBO {
    return {
      read: this.createRT(width, height, filter),
      write: this.createRT(width, height, filter),
      swap() {
        const tmp = this.read
        this.read = this.write
        this.write = tmp
      },
    }
  }

  private renderPass(material: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget) {
    this.quad.material = material
    this.renderer.setRenderTarget(target)
    this.renderer.render(this.quadScene, this.quadCamera)
  }

  getDyeReadback(): { data: Uint8Array; size: number; packScale: number } {
    this.renderer.readRenderTargetPixels(
      this.dyeReadbackRT,
      0,
      0,
      DYE_READBACK_SIZE,
      DYE_READBACK_SIZE,
      this.dyeReadbackBuffer,
    )
    return { data: this.dyeReadbackBuffer, size: DYE_READBACK_SIZE, packScale: DYE_PACK_SCALE }
  }

  updatePointer(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    this.pointer.x = (clientX - rect.left) / rect.width
    this.pointer.y = 1 - (clientY - rect.top) / rect.height
    this.pointer.moved = true
  }

  resize(width: number, height: number) {
    if (width <= 0 || height <= 0) return
    this.aspect = width / height
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
    this.drawReveal(ctx, width, height, dpr)
    this.revealTexture.needsUpdate = true
  }

  private step() {
    const s = this.settings
    const dx = this.pointer.x - this.pointer.prevX
    const dy = this.pointer.y - this.pointer.prevY

    if (this.pointer.moved && (dx !== 0 || dy !== 0)) {
      this.splatMaterial.uniforms.uTarget.value = this.velocity.read.texture
      this.splatMaterial.uniforms.uAspectRatio.value = this.aspect
      this.splatMaterial.uniforms.uPoint.value.set(this.pointer.x, this.pointer.y)
      this.splatMaterial.uniforms.uColor.value.set(dx * s.splatForce, dy * s.splatForce, 0)
      this.splatMaterial.uniforms.uRadius.value = s.splatRadius
      this.renderPass(this.splatMaterial, this.velocity.write)
      this.velocity.swap()

      this.splatMaterial.uniforms.uTarget.value = this.dye.read.texture
      this.splatMaterial.uniforms.uColor.value.set(1, 1, 1)
      this.renderPass(this.splatMaterial, this.dye.write)
      this.dye.swap()
    }
    this.pointer.prevX = this.pointer.x
    this.pointer.prevY = this.pointer.y

    this.curlMaterial.uniforms.uVelocity.value = this.velocity.read.texture
    this.renderPass(this.curlMaterial, this.curlRT)

    this.vorticityMaterial.uniforms.uVelocity.value = this.velocity.read.texture
    this.vorticityMaterial.uniforms.uCurl.value = this.curlRT.texture
    this.renderPass(this.vorticityMaterial, this.velocity.write)
    this.velocity.swap()

    this.advectionMaterial.uniforms.uVelocity.value = this.velocity.read.texture
    this.advectionMaterial.uniforms.uSource.value = this.velocity.read.texture
    this.advectionMaterial.uniforms.uTexelSize.value = this.simTexelSize
    this.advectionMaterial.uniforms.uDissipation.value = s.velocityDissipation
    this.renderPass(this.advectionMaterial, this.velocity.write)
    this.velocity.swap()

    this.advectionMaterial.uniforms.uVelocity.value = this.velocity.read.texture
    this.advectionMaterial.uniforms.uSource.value = this.dye.read.texture
    this.advectionMaterial.uniforms.uTexelSize.value = this.dyeTexelSize
    this.advectionMaterial.uniforms.uDissipation.value = s.dyeDissipation
    this.renderPass(this.advectionMaterial, this.dye.write)
    this.dye.swap()

    this.divergenceMaterial.uniforms.uVelocity.value = this.velocity.read.texture
    this.renderPass(this.divergenceMaterial, this.divergenceRT)

    this.renderer.setRenderTarget(this.pressure.read)
    this.renderer.clear()
    this.renderer.setRenderTarget(null)
    this.pressureMaterial.uniforms.uDivergence.value = this.divergenceRT.texture
    for (let i = 0; i < s.pressureIterations; i++) {
      this.pressureMaterial.uniforms.uPressure.value = this.pressure.read.texture
      this.renderPass(this.pressureMaterial, this.pressure.write)
      this.pressure.swap()
    }

    this.gradientSubtractMaterial.uniforms.uPressure.value = this.pressure.read.texture
    this.gradientSubtractMaterial.uniforms.uVelocity.value = this.velocity.read.texture
    this.renderPass(this.gradientSubtractMaterial, this.velocity.write)
    this.velocity.swap()

    this.maskMaterial.uniforms.uDye.value = this.dye.read.texture
    this.quad.material = this.maskMaterial
    this.renderer.setRenderTarget(null)
    this.renderer.clear()
    this.renderer.render(this.quadScene, this.quadCamera)

    this.dyeCopyMaterial.uniforms.uDye.value = this.dye.read.texture
    this.renderPass(this.dyeCopyMaterial, this.dyeReadbackRT)
    this.renderer.setRenderTarget(null)
  }

  private animate() {
    if (this.disposed) return
    this.rafId = requestAnimationFrame(this.animate)
    this.step()
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.rafId)
    ;[
      this.velocity.read,
      this.velocity.write,
      this.pressure.read,
      this.pressure.write,
      this.dye.read,
      this.dye.write,
      this.curlRT,
      this.divergenceRT,
      this.dyeReadbackRT,
    ].forEach((rt) => rt.dispose())
    ;[
      this.splatMaterial,
      this.curlMaterial,
      this.vorticityMaterial,
      this.advectionMaterial,
      this.divergenceMaterial,
      this.pressureMaterial,
      this.gradientSubtractMaterial,
      this.maskMaterial,
      this.dyeCopyMaterial,
    ].forEach((material) => material.dispose())
    this.quad.geometry.dispose()
    this.revealTexture.dispose()
    this.renderer.dispose()
  }
}
