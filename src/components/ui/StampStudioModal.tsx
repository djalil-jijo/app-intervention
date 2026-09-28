'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Award, Upload, Wand2, Check, RefreshCw, Eye } from 'lucide-react';

interface StampStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stampBase64: string) => void;
  initialStamp?: string | null;
  defaultOrgName?: string;
  defaultServiceName?: string;
  defaultUserName?: string;
}

const STAMP_COLORS = [
  { id: 'blue', label: 'أزرق إداري', hex: '#1d4ed8' },
  { id: 'indigo', label: 'نيلي رسمي', hex: '#4338ca' },
  { id: 'sky', label: 'سماوي تقني', hex: '#0284c7' },
  { id: 'red', label: 'أحمر معتمد', hex: '#b91c1c' },
  { id: 'purple', label: 'بنفسجي رسمي', hex: '#7e22ce' },
  { id: 'green', label: 'أخضر تدقيق', hex: '#047857' },
];

export const StampStudioModal: React.FC<StampStudioModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialStamp,
  defaultOrgName = 'ENTREPRISE INDUSTRIELLE - ALGERIE',
  defaultServiceName = 'DIRECTION DES SYSTEMES D\'INFORMATION',
  defaultUserName = 'SERVICE IT - SUPPORT & INTERVENTIONS',
}) => {
  const [activeTab, setActiveTab] = useState<'generator' | 'upload'>('generator');
  const [stampColor, setStampColor] = useState('#1d4ed8');

  // Generator form fields
  const [topText, setTopText] = useState(defaultOrgName);
  const [bottomText, setBottomText] = useState(defaultServiceName);
  const [centerText1, setCenterText1] = useState('VALIDÉ & APPROUVÉ');
  const [centerText2, setCenterText2] = useState(defaultUserName);
  const [showDate, setShowDate] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [previewStamp, setPreviewStamp] = useState<string | null>(initialStamp || null);

  // Function to render circular official stamp on Canvas
  const drawStamp = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 400;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 14;

    ctx.save();
    ctx.strokeStyle = stampColor;
    ctx.fillStyle = stampColor;

    // 1. Outer double ring
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 8, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Inner ring
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 56, 0, Math.PI * 2);
    ctx.stroke();

    // Helper: draw curved text along arc
    const drawCurvedText = (
      text: string,
      startAngle: number,
      endAngle: number,
      r: number,
      inward: boolean
    ) => {
      const clean = text.trim().toUpperCase();
      if (!clean) return;
      const totalAngle = endAngle - startAngle;
      const angleStep = totalAngle / Math.max(clean.length - 1, 1);

      ctx.font = 'bold 12.5px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = inward ? 'bottom' : 'top';

      for (let i = 0; i < clean.length; i++) {
        const char = clean[i];
        const angle = startAngle + i * angleStep;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        ctx.translate(0, inward ? -r : r);
        if (!inward) ctx.rotate(Math.PI);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }
    };

    // Draw Top Text (curved along top arc)
    drawCurvedText(topText, -Math.PI * 0.78, -Math.PI * 0.22, radius - 26, true);

    // Stars on sides
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', centerX - radius + 28, centerY);
    ctx.fillText('★', centerX + radius - 28, centerY);

    // Draw Bottom Text (curved along bottom arc)
    drawCurvedText(bottomText, Math.PI * 0.22, Math.PI * 0.78, radius - 26, false);

    // 3. Center Content inside Inner Ring
    ctx.font = 'bold 14.5px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(centerText1.toUpperCase(), centerX, centerY - 18);

    // Divider line
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(centerX - 55, centerY);
    ctx.lineTo(centerX + 55, centerY);
    ctx.stroke();

    // Sub center text
    ctx.font = 'bold 11px Arial, sans-serif';
    ctx.fillText(centerText2.substring(0, 36).toUpperCase(), centerX, centerY + 17);

    if (showDate) {
      const year = new Date().getFullYear();
      ctx.font = 'bold 10px Arial, sans-serif';
      ctx.fillText(`SESSION ${year}`, centerX, centerY + 34);
    }

    ctx.restore();

    setPreviewStamp(canvas.toDataURL('image/png'));
  }, [stampColor, topText, bottomText, centerText1, centerText2, showDate]);

  useEffect(() => {
    if (isOpen && activeTab === 'generator') {
      setTimeout(drawStamp, 50);
    }
  }, [isOpen, activeTab, drawStamp]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewStamp(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (previewStamp) {
      onSave(previewStamp);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-navy-900 border border-navy-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">استوديو الختم الرقمي الرسمي</h3>
              <p className="text-xs text-slate-400">توليد ختم دائري رسمي أو رفع صورة الختم المعتمد</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-navy-800 bg-navy-950/40 p-1.5 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('generator')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'generator'
                ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-navy-850'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            <span>مولد الختم الرسمي التلقائي</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-navy-850'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>رفع صورة الختم الفعلي</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'generator' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Controls */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم المؤسسة / الهيكل (أعلى الختم):</label>
                  <input
                    type="text"
                    value={topText}
                    onChange={(e) => setTopText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white focus:border-indigo-400 text-xs"
                    placeholder="Ex: FILIALE EST - DIRECTION REGIONALE"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">المصلحة / المديرية (أسفل الختم):</label>
                  <input
                    type="text"
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white focus:border-indigo-400 text-xs"
                    placeholder="Ex: DIRECTION DES SYSTEMES D'INFORMATION"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">التأشيرة المركزية:</label>
                  <input
                    type="text"
                    value={centerText1}
                    onChange={(e) => setCenterText1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white focus:border-indigo-400 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">الصفة / صاحب الختم:</label>
                  <input
                    type="text"
                    value={centerText2}
                    onChange={(e) => setCenterText2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white focus:border-indigo-400 text-xs"
                    placeholder="Ex: SERVICE MAINTENANCE & SUPPORT"
                  />
                </div>

                {/* Color selector */}
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">لون الحبر الرسمي:</label>
                  <div className="flex items-center gap-2">
                    {STAMP_COLORS.map((col) => (
                      <button
                        type="button"
                        key={col.id}
                        onClick={() => setStampColor(col.hex)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          stampColor === col.hex ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="showDate"
                    checked={showDate}
                    onChange={(e) => setShowDate(e.target.checked)}
                    className="rounded bg-navy-950 border-navy-750 text-indigo-500 focus:ring-0"
                  />
                  <label htmlFor="showDate" className="text-slate-300 font-medium">
                    تضمين سنة الإصدار في مركز الختم
                  </label>
                </div>
              </div>

              {/* Stamp Live Canvas Preview */}
              <div className="flex flex-col items-center justify-center p-5 bg-white/95 rounded-2xl shadow-inner border border-slate-200">
                <canvas ref={canvasRef} className="w-[240px] h-[240px] max-w-full" />
                <span className="text-[11px] text-slate-500 mt-2.5 font-bold font-mono">معاينة الختم الدائري الرسمي بالحجم الطبيعي</span>
              </div>
            </div>
          ) : (
            /* Upload Mode */
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-navy-700 hover:border-indigo-400 rounded-3xl bg-navy-950/60 transition-colors text-center">
              {previewStamp ? (
                <div className="space-y-4">
                  <div className="w-56 h-56 mx-auto p-4 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-200">
                    <img src={previewStamp} alt="Stamp preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-xs font-bold text-slate-200 transition-colors">
                    <Upload className="w-4 h-4 text-sky-400" />
                    <span>تغيير الصورة المرفوعة</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">اختر صورة الختم الرسمي</p>
                    <p className="text-xs text-slate-400 mt-1">يدعم صيغ PNG الشفافة، JPG، أو WEBP بدقة عالية</p>
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-500 text-xs font-extrabold text-white shadow-lg transition-transform hover:scale-105">
                    <Upload className="w-4 h-4" />
                    <span>تصفح الملفات من جهازك</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Info footer banner */}
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750 flex items-center gap-2 text-xs text-slate-400">
            <Eye className="w-4 h-4 text-sky-400 shrink-0" />
            <span>
              يتم وضع هذا الختم المعتمد تلقائياً بجانب إمضائك في جميع طلبات التدخل ومحاضر الاستلام والصيانة الرسمية بصيغة PDF.
            </span>
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
            disabled={!previewStamp}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-indigo-500 to-sky-500 text-white hover:from-indigo-400 hover:to-sky-400 shadow-lg shadow-indigo-950/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Check className="w-4 h-4" />
            <span>حفظ واعتماد الختم الرسمي</span>
          </button>
        </div>
      </div>
    </div>
  );
};
