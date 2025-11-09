import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

export default function RadarScanner({
  gridColor = [0.3, 0.5, 1.0],
  scanColor = [0.4, 0.7, 1.0],
  glowColor = [0.5, 0.7, 1.0],
  scanSpeed = 1.5,
}) {
  const ctnDom = useRef(null);

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3 iResolution;
    uniform vec3 gridColor;
    uniform vec3 scanColor;
    uniform vec3 glowColor;
    uniform float scanSpeed;
    varying vec2 vUv;

    #define PI 3.14159265359

    float ring(vec2 uv, float radius, float thickness, float blur) {
      float d = length(uv);
      return smoothstep(radius + thickness, radius + thickness - blur, d) -
             smoothstep(radius, radius - blur, d);
    }

    void main() {
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (vUv * iResolution.xy - center) / size * 2.0;

      vec3 color = vec3(0.0);
      float distFromCenter = length(uv);

      // Subtle background glow
      float bgGlow = exp(-distFromCenter * 1.5) * 0.2;
      color += glowColor * bgGlow;

      // Draw concentric circles (radar grid)
      float rings[4];
      rings[0] = 0.25;
      rings[1] = 0.5;
      rings[2] = 0.75;
      rings[3] = 0.95;

      for (int i = 0; i < 4; i++) {
        float radius = rings[i];

        // Main ring line
        float ringLine = ring(uv, radius, 0.0015, 0.001);
        color += gridColor * ringLine * 0.6;

        // Subtle glow around the ring
        float ringGlow = ring(uv, radius, 0.01, 0.008);
        color += glowColor * ringGlow * 0.15;
      }

      // REALISTIC RADAR SWEEP LINE
      float sweepAngle = -iTime * scanSpeed; // Negative for clockwise rotation
      float currentAngle = atan(uv.y, uv.x);

      // The main sweep line (like a clock hand)
      float angleDiff = mod(sweepAngle - currentAngle + PI, 2.0 * PI) - PI;
      float sweepLine = smoothstep(0.02, 0.0, abs(angleDiff));

      // Only draw the line within the radar bounds
      float lineMask = smoothstep(0.0, 0.02, distFromCenter) *
                       smoothstep(0.98, 0.95, distFromCenter);

      // Main sweep line - bright and clear
      color += scanColor * sweepLine * lineMask * 1.5;

      // FADING TRAIL behind the sweep line
      // The trail should only be visible behind the line, not in front
      float trailAngle = angleDiff;

      // Only show trail where angle is behind the sweep (negative angle difference)
      if (trailAngle < 0.0) {
        // Exponential fade - gets dimmer the further back from the line
        float trailIntensity = exp(trailAngle * 3.0); // Controls how fast the trail fades

        // Create the trail with the fade
        float trail = trailIntensity * smoothstep(0.98, 0.95, distFromCenter);

        // Add the trail to the color with stronger blue tint
        color += glowColor * trail * 0.6;
      }

      // Outer container ring
      float outerRing = ring(uv, 0.9, 0.1, 0.99);
      color += gridColor * outerRing * 0.9;

      // Outer glow
      float outerGlow = ring(uv, 0.97, 0.9, 0.9);
      color += glowColor * outerGlow * 0.1;

      // Center dot (radar center)
      float centerDot = smoothstep(0.015, 0.01, distFromCenter);
      color += scanColor * centerDot * 0.8;

      // Fade out beyond the radar
      float mask = smoothstep(1.0, 0.95, distFromCenter);
      color *= mask;

      float alpha = max(max(color.r, color.g), color.b);
      gl_FragColor = vec4(color, alpha);
    }
  `;

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Vec3(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height,
          ),
        },
        gridColor: { value: gridColor },
        scanColor: { value: scanColor },
        glowColor: { value: glowColor },
        scanSpeed: { value: scanSpeed },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width * dpr, height * dpr);
      gl.canvas.style.width = width + "px";
      gl.canvas.style.height = height + "px";
      program.uniforms.iResolution.value.set(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height,
      );
    }
    window.addEventListener("resize", resize);
    resize();

    let rafId;
    const update = (t) => {
      rafId = requestAnimationFrame(update);
      program.uniforms.iTime.value = t * 0.001;
      program.uniforms.gridColor.value = gridColor;
      program.uniforms.scanColor.value = scanColor;
      program.uniforms.glowColor.value = glowColor;
      program.uniforms.scanSpeed.value = scanSpeed;

      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [gridColor, scanColor, glowColor, scanSpeed]);

  return <div ref={ctnDom} className="w-full h-full" />;
}
