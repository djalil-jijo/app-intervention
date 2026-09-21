'use client';

import React, { useState, useEffect } from 'react';
import { getTicketCommentsAction, addTicketCommentAction } from '@/app/actions/comments';
import { MessageSquare, Send, Clock, User, ShieldAlert, X } from 'lucide-react';

interface TicketCommentsPanelProps {
  ticketId: string;
  ticketNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TicketCommentsPanel: React.FC<TicketCommentsPanelProps> = ({
  ticketId,
  ticketNumber,
  isOpen,
  onClose,
}) => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState('التقني المكلف');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await getTicketCommentsAction(ticketId);
      if (res.success && res.data) setComments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ticketId) {
      fetchComments();
    }
  }, [isOpen, ticketId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const res = await addTicketCommentAction({
        ticketId,
        author,
        content,
      });
      if (res.success) {
        setContent('');
        fetchComments();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-navy-750 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[85vh] text-right">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-navy-800 pb-3 mb-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              سجل الملاحظات والمتابعة الداخلية
            </h3>
            <p className="text-xs text-sky-400 font-mono mt-0.5 dir-ltr text-right">
              {ticketNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments History */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 pl-1 mb-4 min-h-[220px]">
          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">جاري تحميل السجل...</div>
          ) : comments.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-1">
              <p>لا توجد ملاحظات داخلية على هذه التذكرة بعد.</p>
              <p className="text-slate-500 text-[11px]">أضف ملاحظة أو تحديث حول فحص المشكلة أدناه.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-2xl border text-xs ${
                  comment.isSystem
                    ? 'bg-navy-950/60 border-navy-800 text-slate-400'
                    : 'bg-navy-850 border-navy-750 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-sky-300">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    <span>{comment.author}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(comment.createdAt).toLocaleString('ar-DZ', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>

        {/* Add comment form */}
        <form onSubmit={handleSubmit} className="border-t border-navy-800 pt-3 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="اسم الكاتب (التقني)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-1/3 px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white placeholder-slate-500 outline-none"
            />
            <span className="text-[11px] text-slate-500 flex-1">ملاحظة تقنية داخلية</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="اكتب ملاحظة أو تطور في الفحص..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white placeholder-slate-500 focus:border-sky-500 outline-none"
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
