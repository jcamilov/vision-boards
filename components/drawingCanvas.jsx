import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";

const DrawingCanvas = forwardRef(
  ({ isActive, onMaskComplete, className, brushSize = 5 }, ref) => {
    const canvasRef = useRef(null);
    const isDrawing = useRef(false);

    useImperativeHandle(ref, () => ({
      clearCanvas: () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const resizeCanvas = () => {
        const parent = canvas.parentElement;
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    const startDrawing = (e) => {
      if (!isActive) return;
      isDrawing.current = true;
      draw(e);
    };

    const stopDrawing = () => {
      if (!isActive) return;
      isDrawing.current = false;
      const maskDataUrl = canvasRef.current.toDataURL();
      onMaskComplete(maskDataUrl);
    };

    const draw = (e) => {
      if (!isActive || !isDrawing.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";

      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    return (
      <canvas
        ref={canvasRef}
        className={className}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onMouseMove={draw}
      />
    );
  }
);

DrawingCanvas.displayName = "DrawingCanvas";

export default DrawingCanvas;
