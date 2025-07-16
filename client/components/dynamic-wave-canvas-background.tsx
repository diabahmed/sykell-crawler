import { useEffect, useRef } from "react";

const HeroWave = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const SCALE = 3;

    let width: number, height: number;
    let imageData: ImageData;
    let data: Uint8ClampedArray;

    const SIN_TABLE = new Float32Array(1024);
    const COS_TABLE = new Float32Array(1024);
    for (let i = 0; i < 1024; i++) {
      const angle = (i / 1024) * Math.PI * 2;
      SIN_TABLE[i] = Math.sin(angle);
      COS_TABLE[i] = Math.cos(angle);
    }

    const fastSin = (x: number) => SIN_TABLE[((x * 162.97466) & 1023) >>> 0];
    const fastCos = (x: number) => COS_TABLE[((x * 162.97466) & 1023) >>> 0];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      width = Math.floor(canvas.width / SCALE);
      height = Math.floor(canvas.height / SCALE);
      imageData = ctx.createImageData(width, height);
      data = imageData.data;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    let animationFrameId: number;
    const startTime = performance.now();

    const render = () => {
      const time = (performance.now() - startTime) * 0.001;

      let idx = 0;
      for (let y = 0; y < height; y++) {
        const u_y = (2 * y - height) / height;
        for (let x = 0; x < width; x++) {
          const u_x = (2 * x - width) / height;

          let a = 0,
            d = 0;
          for (let i = 0; i < 4; i++) {
            a += fastCos(i - d + time * 0.5 - a * u_x);
            d += fastSin(i * u_y + a);
          }

          const wave = (fastSin(a) + fastCos(d)) * 0.5;
          const intensity = 0.3 + 0.4 * wave;
          const base = 0.1 + 0.15 * fastCos(u_x + u_y + time * 0.3);
          const blue = 0.2 * fastSin(a * 1.5 + time * 0.2);
          const purple = 0.15 * fastCos(d * 2 + time * 0.1);

          const r = Math.min(1, Math.max(0, base + purple * 0.8)) * intensity;
          const g = Math.min(1, Math.max(0, base + blue * 0.6)) * intensity;
          const b =
            Math.min(1, Math.max(0, base + blue * 1.2 + purple * 0.4)) *
            intensity;

          data[idx++] = r * 255;
          data[idx++] = g * 255;
          data[idx++] = b * 255;
          data[idx++] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      if (SCALE > 1) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
          canvas,
          0,
          0,
          width,
          height,
          0,
          0,
          canvas.width,
          canvas.height
        );
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

export default HeroWave;
