'use client';

import React, { useRef, useState, useEffect } from 'react';
import { X, PenTool, RotateCcw, Upload, Check, Eye } from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureBase64: string) => void;
  initialSignature?: string | null;
  title?: string;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSignature,
  title = 'التوقيع الرقمي المعتمد',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#0f172a'); // default deep navy/black ink
  const [lineWidth, setLineWidth] = useState(2.5);
  const [previewData, setPreviewData] = useState<string | null>(initialSignature || null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
      }

      if (initialSignature) {
        const img = new Image();
        img.onload = () => {
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setHasDrawn(true);
        };
        img.src = initialSignature;
      } else {
        clearCanvas();
      }
    }
  }, [isOpen, initialSignature]);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
      }
    }
  }, [strokeColor, lineWidth]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      setPreviewData(canvasRef.current.toDataURL('image/png'));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setPreviewData(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw maintaining aspect ratio centered
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.min(hRatio, vRatio, 1);
        const centerShiftX = (canvas.width - img.width * ratio) / 2;
        const centerShiftY = (canvas.height - img.height * ratio) / 2;

        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShiftX,
          centerShiftY,
          img.width * ratio,
          img.height * ratio
        );
        setHasDrawn(true);
        setPreviewData(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (canvasRef.current && hasDrawn) {
      const data = canvasRef.current.toDataURL('image/png');
      onSave(data);
      onClose();
    } else if (previewData) {
      onSave(previewData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-navy-900 border border-navy-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">{title}</h3>
              <p className="text-xs text-slate-400">ارسم توقيعك بالماوس/الشاشة أو قم برفع صورة ممسوحة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Controls toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold">لون الحبر:</span>
              <button
                type="button"
                onClick={() => setStrokeColor('#0f172a')}
                className={`w-6 h-6 rounded-full bg-slate-900 border-2 transition-all ${
                  strokeColor === '#0f172a' ? 'border-sky-400 scale-110 shadow-glow-sky' : 'border-slate-600'
                }`}
                title="أسود رسمي"
              />
              <button
                type="button"
                onClick={() => setStrokeColor('#1e40af')}
                className={`w-6 h-6 rounded-full bg-blue-800 border-2 transition-all ${
                  strokeColor === '#1e40af' ? 'border-sky-400 scale-110 shadow-glow-sky' : 'border-slate-600'
                }`}
                title="أزرق رسمي"
              />
              <button
                type="button"
                onClick={() => setStrokeColor('#0369a1')}
                className={`w-6 h-6 rounded-full bg-sky-700 border-2 transition-all ${
                  strokeColor === '#0369a1' ? 'border-sky-400 scale-110 shadow-glow-sky' : 'border-slate-600'
                }`}
                title="سماوي تقني"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 transition-colors">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>رفع صورة</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={clearCanvas}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-rose-300 hover:text-rose-200 border border-navy-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>مسح</span>
              </button>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="relative rounded-2xl bg-white border-2 border-dashed border-sky-400/40 p-2 shadow-inner overflow-hidden flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={450}
              height={180}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="touch-none cursor-crosshair bg-white w-full h-[180px]"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400/70">
                <PenTool className="w-8 h-8 mb-1 opacity-40 animate-bounce" />
                <span className="text-xs font-semibold">ارسم توقيعك هنا عبر شاشة اللمس أو الماوس</span>
              </div>
            )}
            <div className="absolute bottom-2 left-4 text-[10px] text-slate-400 font-mono select-none pointer-events-none">
              Émargement certifié
            </div>
          </div>

          {/* Preview banner */}
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              سيتم تضمين هذا التوقيع تلقائياً في خانة توقيعك الرسمية في مستندات PDF
            </span>
            {hasDrawn && (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                جاهز للاعتماد
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy-800 bg-navy-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!hasDrawn && !previewData}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:from-sky-400 hover:to-indigo-500 shadow-lg shadow-sky-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Check className="w-4 h-4" />
            <span>حفظ واعتماد التوقيع</span>
          </button>
        </div>
      </div>
    </div>
  );
};
