'use client';
import { useEffect, useRef } from 'react';

export default function LiquidGlassOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const iconsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = (canvas.getContext('webgl', { antialias: true }) || canvas.getContext('experimental-webgl', { antialias: true })) as WebGLRenderingContext | null;
    if (!gl) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      (canvas.style as any).width = window.innerWidth + 'px';
      (canvas.style as any).height = window.innerHeight + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();

    const vsrc = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
          v_uv = vec2(a_position.x, -a_position.y) * 0.5 + 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;
    const fsrc = `
      precision mediump float;
      uniform float u_dpr;
      uniform sampler2D u_background;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform vec2 u_size;
      varying vec2 v_uv;

      float roundedBox(vec2 uv, vec2 center, vec2 size, float radius) {
          vec2 q = abs(uv - center) - size + radius;
          return length(max(q, 0.0)) - radius;
      }

      vec3 blurBackground(vec2 uv, vec2 resolution) {
          vec3 result = vec3(0.0);
          float total = 0.0;
          float radius = 3.0;
          for (int x = -3; x <= 3; x++) {
              for (int y = -3; y <= 3; y++) {
                  vec2 offset = vec2(float(x), float(y)) * 2.0 / resolution;
                  float weight = exp(-(float(x * x + y * y)) / (2.0 * radius));
                  result += texture2D(u_background, uv + offset).rgb * weight;
                  total += weight;
              }
          }
          return result / total;
      }

      float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b + vec2(r);
          return length(max(d, 0.0)) - r;
      }

      vec2 getNormal(vec2 uv, vec2 center, vec2 size, float radius, vec2 resolution) {
          vec2 eps = vec2(1.0) / resolution * 2.0;
          vec2 p = uv - center;
          float sdfCenter = roundedBoxSDF(p, size, radius);
          float dx = (roundedBoxSDF(p + vec2(eps.x, 0.0), size, radius) - roundedBoxSDF(p - vec2(eps.x, 0.0), size, radius)) * 0.5;
          float dy = (roundedBoxSDF(p + vec2(0.0, eps.y), size, radius) - roundedBoxSDF(p - vec2(0.0, eps.y), size, radius)) * 0.5;
          vec2 gradient = vec2(dx, dy);
          vec2 diag = vec2(roundedBoxSDF(p + eps, size, radius) - roundedBoxSDF(p - eps, size, radius));
          gradient = mix(gradient, diag, 0.25);
          if (length(gradient) < 0.001) return vec2(0.0);
          return normalize(gradient);
      }

      void main() {
          vec2 pixelUV = (v_uv * u_resolution) / u_dpr;
          vec2 center = u_mouse;
          vec2 size = u_size * 0.5;
          vec2 local = (pixelUV - center) / size;
          local.y *= u_resolution.x / u_resolution.y;
          float radius = 20.0;
          float dist = roundedBox(pixelUV, center, size, radius);
          if (dist > 1.0) {
              gl_FragColor = texture2D(u_background, v_uv);
              return;
          }
          float r = clamp(length(local * 1.0), 0.0, 1.0);
          float curvature = pow(r, 1.0);
          vec2 domeNormal = normalize(local) * curvature;
          float eta = 1.0 / 1.5;
          vec2 incident = -domeNormal;
          vec2 refractVec = refract(incident, domeNormal, eta);
          vec2 curvedRefractUV = v_uv + refractVec * 0.03;
          float contourFalloff = exp(-abs(dist) * 0.4);
          vec2 normal = getNormal(pixelUV, center, size, radius, u_resolution);
          vec2 domeNormalContour = normal * pow(contourFalloff, 1.5);
          vec2 refractVecContour = refract(vec2(0.0), domeNormalContour, eta);
          vec2 uvContour = v_uv + refractVecContour * 0.35 * contourFalloff;
          float edgeWeight = smoothstep(0.0, 1.0, abs(dist));
          float radialWeight = smoothstep(0.5, 1.0, r);
          float combinedWeight = clamp((edgeWeight * 1.0) + (-radialWeight * 0.5), 0.0, 1.0);
          vec2 refractUV = mix(curvedRefractUV, uvContour, combinedWeight);
          vec3 refracted = texture2D(u_background, refractUV).rgb;
          vec3 blurred = blurBackground(refractUV, u_resolution);
          vec3 base = mix(refracted, blurred, 0.5);
          float edgeFalloff = smoothstep(0.01, 0.0, dist);
          float verticalBand = 1.0 - smoothstep(-1.5, -0.2, local.y);
          float topShadow = edgeFalloff * verticalBand;
          vec3 shadowColor = vec3(0.0);
          base = mix(base, shadowColor, topShadow * 0.1);
          float edge = 1.0 - smoothstep(0.0, 0.03, dist * -2.0);
          vec3 glow = vec3(0.7);
          vec3 color = mix(base, glow, edge * 0.5);
          float alpha = 0.75;
          gl_FragColor = vec4(color, alpha);
      }
    `;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const v = compile(gl.VERTEX_SHADER, vsrc);
    const f = compile(gl.FRAGMENT_SHADER, fsrc);
    if (!v || !f) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, v);
    gl.attachShader(prog, f);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1
    ]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const u_resolution = gl.getUniformLocation(prog, 'u_resolution');
    const u_mouse = gl.getUniformLocation(prog, 'u_mouse');
    const u_size = gl.getUniformLocation(prog, 'u_size');

    // Use current canvas as background texture by reading from the DOM
    const bgTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, bgTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0,0,0,255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(prog, 'u_background'), 0);
    const u_dpr = gl.getUniformLocation(prog, 'u_dpr');
    gl.uniform1f(u_dpr, window.devicePixelRatio || 1);

    let targetMouse: [number, number] = [window.innerWidth / 2, window.innerHeight / 2];
    let currentMouse: [number, number] = [...targetMouse];
    const iconWrapper = iconsRef.current!;
    const speed = 5.0;
    let lastTime = performance.now();

    const onMove = (e: MouseEvent) => {
      targetMouse = [e.clientX, e.clientY];
    };
    window.addEventListener('mousemove', onMove);

    const draw = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      currentMouse[0] += (targetMouse[0] - currentMouse[0]) * speed * delta;
      currentMouse[1] += (targetMouse[1] - currentMouse[1]) * speed * delta;

      const defaultWidth = 240; // pill size
      const defaultHeight = 56;
      const sizeX = defaultWidth;
      const sizeY = defaultHeight;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u_resolution, canvas.width, canvas.height);
      gl.uniform2f(u_mouse, currentMouse[0], currentMouse[1]);
      gl.uniform2f(u_size, sizeX, sizeY);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, bgTex);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      iconWrapper.style.transform = `translate(${currentMouse[0]}px, ${currentMouse[1]}px) translate(-50%, -50%)`;
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <div ref={iconsRef} id="icons" style={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'center center', display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', color: 'white', fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
        {/* Labels will be injected by parent via HoverLabel; keep placeholder */}
      </div>
    </div>
  );
}


