import { useRef, useEffect, useState } from "react";
import { Renderer, Program, Triangle, Mesh } from "ogl";

const DEFAULT_COLOR = "8aa5ff";

const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [
        parseInt(m[1], 16) / 255,
        parseInt(m[2], 16) / 255,
        parseInt(m[3], 16) / 255,
      ]
    : [1, 1, 1];
};

const getAnchorAndDir = (origin, w, h) => {
  const outside = 0.2;
  switch (origin) {
    case "top-left":
      return { anchor: [0, -outside * h], dir: [0, 1] };
    case "top-right":
      return { anchor: [w, -outside * h], dir: [0, 1] };
    case "left":
      return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
    case "right":
      return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
    case "bottom-left":
      return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
    case "bottom-center":
      return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
    case "bottom-right":
      return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
    default: // "top-center"
      return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
  }
};

const LightRays = ({
  raysOrigin = "top-center",
  raysColor = DEFAULT_COLOR,
  raysSpeed = 0.4,
  lightSpread = 10,
  rayLength = 2,
  pulsating = false,
  fadeDistance = 5,
  saturation = 0,
  followMouse = false,
  mouseInfluence = 0.0,
  noiseAmount = 0.0,
  distortion = 0.0,
  numRays = 8,
  rotationSpeed = 0.3,
  className = "",
}) => {
  const containerRef = useRef(null);
  const uniformsRef = useRef(null);
  const rendererRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef({ x: 0.5, y: 0.5 });
  const animationIdRef = useRef(null);
  const meshRef = useRef(null);
  const cleanupFunctionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observerRef.current.observe(containerRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    if (cleanupFunctionRef.current) {
      cleanupFunctionRef.current();
      cleanupFunctionRef.current = null;
    }

    const initializeWebGL = async () => {
      if (!containerRef.current) return;

      await new Promise((resolve) => setTimeout(resolve, 10));

      if (!containerRef.current) return;

      const renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio, 2),
        alpha: true,
      });
      rendererRef.current = renderer;

      const gl = renderer.gl;
      gl.canvas.style.width = "100%";
      gl.canvas.style.height = "100%";

      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      containerRef.current.appendChild(gl.canvas);

      const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

      const frag = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;
uniform float numRays;
uniform float rotationSpeed;

varying vec2 vUv;

#define PI 3.14159265359

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float random(float x) {
  return fract(sin(x * 12.9898) * 43758.5453);
}

// Rotation matrix
vec2 rotate(vec2 v, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec2(v.x * c - v.y * s, v.x * s + v.y * c);
}

// Simple vertical beam with slight angle
float angledBeam(vec2 rayStart, vec2 coord, float width, float lengthMultiplier, float angle) {
  // Apply slight rotation to the coordinate system
  vec2 relativeCoord = coord - rayStart;
  vec2 rotatedCoord = rotate(relativeCoord, -angle);

  float distX = abs(rotatedCoord.x);
  float distY = rotatedCoord.y;

  // Only render downward
  if (distY < 0.0) return 0.0;

  // Soft beam shape
  float beamShape = exp(-distX * distX / (width * width));

  // Length with soft falloff
  float maxLen = iResolution.y * rayLength * lengthMultiplier;
  float lengthFade = smoothstep(maxLen, maxLen * 0.5, distY);

  // Distance fade
  float distFade = 1.0 - smoothstep(0.0, iResolution.y * fadeDistance, length(relativeCoord));

  return beamShape * lengthFade * distFade;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec4 finalColor = vec4(0.0);

  // Simple vertical beams spread across width with random properties
  for (float i = 0.0; i < 16.0; i += 1.0) {
    if (i >= numRays) break;

    // Evenly space rays across screen width
    float spacing = iResolution.x / (numRays + 1.0);
    vec2 rayPosition = vec2(spacing * (i + 1.0), rayPos.y);

    // Base random width for each ray
    float widthVariation = random(i * 7.123);
    float baseWidth = iResolution.x * (0.02 + widthVariation * 0.03);

    // Calculate subtle angle toward center (500px below top)
    vec2 convergencePoint = vec2(iResolution.x * 0.5, 500.0);
    vec2 toConvergence = convergencePoint - rayPosition;
    float convergenceAngle = atan(toConvergence.x, toConvergence.y) * 0.25;

    // Random variation angle
    float angleVariation = random(i * 13.456);
    float randomAngle = (angleVariation - 0.5) * 0.15;

    // Combine both: subtle convergence + random variation
    float angle = convergenceAngle + randomAngle;

    // Animate length AND width for 40% of rays
    float lengthMultiplier = 1.0;
    float widthMultiplier = 1.0;
    if (i < numRays * 0.4) {
      // Much faster and more visible animation
      float phase = sin(iTime * 2.0 + i * 2.0) * 0.5 + 0.5;
      lengthMultiplier = 0.2 + phase * 0.8;  // 20% to 100%
      widthMultiplier = 0.6 + phase * 0.8;   // 60% to 140%
    }

    float width = baseWidth * widthMultiplier;

    // Calculate beam
    float beam = angledBeam(rayPosition, coord, width, lengthMultiplier, angle);

    finalColor += vec4(1.0) * beam;
  }

  fragColor = finalColor;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  // Vertical brightness gradient (brighter at top)
  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.3 + brightness * 0.7;
  fragColor.y *= 0.4 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  // Apply blue color (#8aa5ff)
  fragColor.rgb *= raysColor;

  // Calculate radial distance from center (0 at center, 1 at edges)
  vec2 centerPos = iResolution.xy * 0.5;
  float distFromCenter = length(coord - centerPos) / (length(iResolution.xy) * 0.5);

  // Radial gradient: full opacity at center (0%), transparent at edges (100%)
  float radialAlpha = 1.0 - smoothstep(0.0, 1.0, distFromCenter);

  // Apply radial gradient to alpha
  fragColor.a = fragColor.a * radialAlpha;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`;

      const uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },

        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },

        raysColor: { value: hexToRgb(raysColor) },
        raysSpeed: { value: raysSpeed },
        lightSpread: { value: lightSpread },
        rayLength: { value: rayLength },
        pulsating: { value: pulsating ? 1.0 : 0.0 },
        fadeDistance: { value: fadeDistance },
        saturation: { value: saturation },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: mouseInfluence },
        noiseAmount: { value: noiseAmount },
        distortion: { value: distortion },
        numRays: { value: numRays },
        rotationSpeed: { value: rotationSpeed },
      };
      uniformsRef.current = uniforms;

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex: vert,
        fragment: frag,
        uniforms,
      });
      const mesh = new Mesh(gl, { geometry, program });
      meshRef.current = mesh;

      const updatePlacement = () => {
        if (!containerRef.current || !renderer) return;

        renderer.dpr = Math.min(window.devicePixelRatio, 2);

        const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
        renderer.setSize(wCSS, hCSS);

        const dpr = renderer.dpr;
        const w = wCSS * dpr;
        const h = hCSS * dpr;

        uniforms.iResolution.value = [w, h];

        const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
        uniforms.rayPos.value = anchor;
        uniforms.rayDir.value = dir;
      };

      const loop = (t) => {
        if (!rendererRef.current || !uniformsRef.current || !meshRef.current) {
          return;
        }

        uniforms.iTime.value = t * 0.001;

        // Debug - remove after testing
        if (Math.floor(t / 1000) % 2 === 0 && t % 1000 < 50) {
          console.log('LightRays animating, iTime:', uniforms.iTime.value);
        }

        if (followMouse && mouseInfluence > 0.0) {
          const smoothing = 0.92;

          smoothMouseRef.current.x =
            smoothMouseRef.current.x * smoothing +
            mouseRef.current.x * (1 - smoothing);
          smoothMouseRef.current.y =
            smoothMouseRef.current.y * smoothing +
            mouseRef.current.y * (1 - smoothing);

          uniforms.mousePos.value = [
            smoothMouseRef.current.x,
            smoothMouseRef.current.y,
          ];
        }

        try {
          renderer.render({ scene: mesh });
          animationIdRef.current = requestAnimationFrame(loop);
        } catch (error) {
          console.warn("WebGL rendering error:", error);
          return;
        }
      };

      window.addEventListener("resize", updatePlacement);
      updatePlacement();
      animationIdRef.current = requestAnimationFrame(loop);

      cleanupFunctionRef.current = () => {
        if (animationIdRef.current) {
          cancelAnimationFrame(animationIdRef.current);
          animationIdRef.current = null;
        }

        window.removeEventListener("resize", updatePlacement);

        if (renderer) {
          try {
            const canvas = renderer.gl.canvas;
            const loseContextExt =
              renderer.gl.getExtension("WEBGL_lose_context");
            if (loseContextExt) {
              loseContextExt.loseContext();
            }

            if (canvas && canvas.parentNode) {
              canvas.parentNode.removeChild(canvas);
            }
          } catch (error) {
            console.warn("Error during WebGL cleanup:", error);
          }
        }

        rendererRef.current = null;
        uniformsRef.current = null;
        meshRef.current = null;
      };
    };

    initializeWebGL();

    return () => {
      if (cleanupFunctionRef.current) {
        cleanupFunctionRef.current();
        cleanupFunctionRef.current = null;
      }
    };
  }, [
    isVisible,
    raysOrigin,
    raysColor,
    raysSpeed,
    lightSpread,
    rayLength,
    pulsating,
    fadeDistance,
    saturation,
    followMouse,
    mouseInfluence,
    noiseAmount,
    distortion,
    numRays,
    rotationSpeed,
  ]);

  useEffect(() => {
    if (!uniformsRef.current || !containerRef.current || !rendererRef.current)
      return;

    const u = uniformsRef.current;
    const renderer = rendererRef.current;

    u.raysColor.value = hexToRgb(raysColor);
    u.raysSpeed.value = raysSpeed;
    u.lightSpread.value = lightSpread;
    u.rayLength.value = rayLength;
    u.pulsating.value = pulsating ? 1.0 : 0.0;
    u.fadeDistance.value = fadeDistance;
    u.saturation.value = saturation;
    u.mouseInfluence.value = mouseInfluence;
    u.noiseAmount.value = noiseAmount;
    u.distortion.value = distortion;
    u.numRays.value = numRays;
    u.rotationSpeed.value = rotationSpeed;

    const { clientWidth: wCSS, clientHeight: hCSS } = containerRef.current;
    const dpr = renderer.dpr;
    const { anchor, dir } = getAnchorAndDir(raysOrigin, wCSS * dpr, hCSS * dpr);
    u.rayPos.value = anchor;
    u.rayDir.value = dir;
  }, [
    raysColor,
    raysSpeed,
    lightSpread,
    raysOrigin,
    rayLength,
    pulsating,
    fadeDistance,
    saturation,
    mouseInfluence,
    noiseAmount,
    distortion,
    numRays,
    rotationSpeed,
  ]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current || !rendererRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      mouseRef.current = { x, y };
    };

    if (followMouse) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [followMouse]);

  return (
    <div className="relative w-full h-full max-w-7xl mx-auto">
      {/* Blue glow background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%,var(--token-077104a2-d76f-4b61-ba61-73e253fa3923,#2934ff)0%,#ababab00 100%)",
        }}
      />
      <div
        ref={containerRef}
        className={`light-rays-container ${className}`.trim()}
      />
    </div>
  );
};

export default LightRays;
