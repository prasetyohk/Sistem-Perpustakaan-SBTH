'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Send,
  MessageCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Check,
  Edit3,
  Save,
  BookOpen,
  User,
  Heart,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { WhatsAppReminderTemplate, Loan, Member } from '@/types';
import { DEFAULT_WHATSAPP_TEMPLATES } from '@/lib/constants';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';

interface WhatsAppCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppCenterModal: React.FC<WhatsAppCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'SEND_REMINDER' | 'TEMPLATES'>('SEND_REMINDER');
  const [templates, setTemplates] = useState<WhatsAppReminderTemplate[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [schoolProfile, setSchoolProfile] = useState(libraryStore.getSchoolProfile());

  // Filter for loans
  const [loanFilter, setLoanFilter] = useState<'ALL' | 'OVERDUE' | 'DUE_SOON'>('ALL');

  // Editing template state
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [templateContent, setTemplateContent] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setTemplates(libraryStore.getWhatsAppTemplates());
      setLoans(libraryStore.getLoans());
      setMembers(libraryStore.getMembers());
      setSchoolProfile(libraryStore.getSchoolProfile());
      setEditingTemplateId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Active / overdue loans
  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');

  const filteredLoans = activeLoans.filter((l) => {
    if (loanFilter === 'OVERDUE') return l.status === 'OVERDUE';
    if (loanFilter === 'DUE_SOON') {
      const due = new Date(l.dueDate).getTime();
      const now = new Date().getTime();
      const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 2 && diffDays >= 0;
    }
    return true;
  });

  const getMember = (memberId: string) => members.find((m) => m.id === memberId);

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return '';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return clean;
  };

  const generateMessageText = (loan: Loan, templateType: 'DUE_REMINDER' | 'OVERDUE' | 'REMINDER_OVERDUE' | 'REMINDER_DUE_DATE') => {
    const member = getMember(loan.memberId);
    const tmpl = templates.find((t) => t.type === templateType || (templateType === 'REMINDER_OVERDUE' && t.type === 'OVERDUE') || (templateType === 'REMINDER_DUE_DATE' && t.type === 'DUE_REMINDER')) || templates[0];
    if (!tmpl) return '';

    const firstItem = loan.items[0];
    const bookTitle = firstItem ? firstItem.bookTitle : 'Buku Cerita';

    const now = new Date();
    const dueDate = new Date(loan.dueDate);
    const diffTime = now.getTime() - dueDate.getTime();
    const overdueDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const fineEstimate = overdueDays * 1000;

    let text = tmpl.templateText || (tmpl as any).template || '';
    text = text.replace(/\{nama_ortu\}/g, member?.parentName || 'Ayah/Bunda');
    text = text.replace(/\{nama_siswa\}/g, member?.name || 'Ananda');
    text = text.replace(/\{kelas\}/g, member?.classGroup || 'KB-TK');
    text = text.replace(/\{judul_buku\}/g, bookTitle);
    text = text.replace(/\{jatuh_tempo\}/g, loan.dueDate);
    text = text.replace(/\{terlambat_hari\}/g, String(overdueDays));
    text = text.replace(
      /\{denda\}/g,
      libraryStore.getFinanceModuleEnabled() ? `Rp ${fineEstimate.toLocaleString('id-ID')}` : '0'
    );

    return text;
  };

  const handleSendWhatsApp = (loan: Loan) => {
    const member = getMember(loan.memberId);
    if (!member || !member.parentPhone) {
      alert('Nomor WhatsApp orang tua belum terdaftar pada data siswa ini.');
      return;
    }

    const cleanPhone = formatPhoneNumber(member.parentPhone);
    const isOverdue = loan.status === 'OVERDUE';
    const msg = generateMessageText(loan, isOverdue ? 'OVERDUE' : 'DUE_REMINDER');

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');

    libraryStore.addActivityLog({
      category: 'CIRCULATION',
      action: 'KIRIM_WA_REMINDER',
      actor: 'Pustakawan',
      targetMember: member.name,
      details: `Mengirim pesan WhatsApp pengingat peminjaman kepada ${member.parentName} (${member.parentPhone}) untuk buku "${loan.items[0]?.bookTitle || 'Buku'}"`,
    });

    soundFx.playSuccessChime();
  };

  const handleStartEditTemplate = (tmpl: WhatsAppReminderTemplate) => {
    setEditingTemplateId(tmpl.id);
    setTemplateContent(tmpl.templateText || (tmpl as any).template || '');
    soundFx.playScanBeep();
  };

  const handleSaveTemplate = (id: string) => {
    libraryStore.updateWhatsAppTemplate(id, templateContent);
    setTemplates(libraryStore.getWhatsAppTemplates());
    setEditingTemplateId(null);
    soundFx.playSuccessChime();
  };

  const handleResetTemplates = () => {
    if (confirm('Kembalikan semua template pesan WhatsApp ke teks standar bawaan?')) {
      libraryStore.saveWhatsAppTemplates(DEFAULT_WHATSAPP_TEMPLATES);
      setTemplates(DEFAULT_WHATSAPP_TEMPLATES);
      setEditingTemplateId(null);
      soundFx.playSuccessChime();
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-xs">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-text">
                Pusat Pengingat WhatsApp Perpustakaan SBTH
              </h3>
              <p className="text-xs text-text-muted">
                Kirim pesan otomatis via WhatsApp Web & sesuaikan redaksi kata-kata pengingat ke wali murid
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('SEND_REMINDER')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'SEND_REMINDER'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Send className="h-4 w-4" />
            <span>Kirim Pengingat Peminjaman ({activeLoans.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TEMPLATES')}
            className={`pb-2.5 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'TEMPLATES'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            <span>Kelola Format Pesan (Editable)</span>
          </button>
        </div>

        {/* Tab 1: Kirim Pengingat */}
        {activeTab === 'SEND_REMINDER' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-surface-2 border border-border">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-muted">Filter Peminjaman:</span>
                <button
                  type="button"
                  onClick={() => setLoanFilter('ALL')}
                  className={`px-3 py-1 rounded-xl font-bold transition ${
                    loanFilter === 'ALL'
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : 'bg-surface text-text-muted hover:text-text'
                  }`}
                >
                  Semua Aktif ({activeLoans.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLoanFilter('OVERDUE')}
                  className={`px-3 py-1 rounded-xl font-bold transition ${
                    loanFilter === 'OVERDUE'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-surface text-rose-500 hover:bg-rose-500/10'
                  }`}
                >
                  Terlambat ({activeLoans.filter((l) => l.status === 'OVERDUE').length})
                </button>
                <button
                  type="button"
                  onClick={() => setLoanFilter('DUE_SOON')}
                  className={`px-3 py-1 rounded-xl font-bold transition ${
                    loanFilter === 'DUE_SOON'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'bg-surface text-amber-500 hover:bg-amber-500/10'
                  }`}
                >
                  Jatuh Tempo 1-2 Hari
                </button>
              </div>

              <div className="text-[11px] text-text-muted">
                Klik tombol <strong className="text-emerald-500">Kirim WA</strong> untuk membuka WhatsApp Web/App dengan teks otomatis siap kirim.
              </div>
            </div>

            {/* List Loans */}
            {filteredLoans.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl text-text-muted">
                Tidak ada peminjaman yang cocok dengan filter saat ini.
              </div>
            ) : (
              <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-2 text-text-muted border-b border-border font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Siswa & Kelas</th>
                      <th className="py-2.5 px-3">Buku Dipinjam</th>
                      <th className="py-2.5 px-3">Jatuh Tempo</th>
                      <th className="py-2.5 px-3">Orang Tua & No. WA</th>
                      <th className="py-2.5 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredLoans.map((loan) => {
                      const member = getMember(loan.memberId);
                      const isOverdue = loan.status === 'OVERDUE';
                      const firstItem = loan.items[0];

                      return (
                        <tr key={loan.id} className="hover:bg-surface-2/60 transition">
                          <td className="py-3 px-3">
                            <div className="font-bold text-text">{member?.name || 'Siswa'}</div>
                            <div className="text-[11px] text-text-muted">{member?.classGroup || '-'}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-text max-w-[200px] truncate">
                              {firstItem?.bookTitle || 'Buku Cerita'}
                            </div>
                            <div className="text-[10px] font-mono text-text-muted">
                              {firstItem?.itemBarcode}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-semibold text-[11px] inline-flex items-center gap-1 ${
                                isOverdue
                                  ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                              }`}
                            >
                              <Clock className="h-3 w-3" />
                              <span>{loan.dueDate}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-text">
                              {member?.parentName || 'Wali Murid'}
                            </div>
                            <div className="text-[11px] font-mono text-emerald-500">
                              {member?.parentPhone || 'Belum ada nomor WA'}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleSendWhatsApp(loan)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 ml-auto cursor-pointer"
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span>Kirim WA</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Kelola Template Pesan (Editable) */}
        {activeTab === 'TEMPLATES' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-2 border border-border">
              <div>
                <h4 className="font-bold text-text text-xs">Variabel / Tag Dinamis yang Tersedia:</h4>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[
                    '{nama_ortu}',
                    '{nama_siswa}',
                    '{kelas}',
                    '{judul_buku}',
                    '{jatuh_tempo}',
                    '{terlambat_hari}',
                    '{denda}',
                  ].map((tag) => (
                    <code
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-surface border border-border text-emerald-500 font-mono text-[11px]"
                    >
                      {tag}
                    </code>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetTemplates}
                className="px-3 py-1.5 rounded-xl border border-border bg-surface text-text-muted hover:text-amber-500 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset ke Standar</span>
              </button>
            </div>

            <div className="space-y-4">
              {templates.map((tmpl) => {
                const isEditing = editingTemplateId === tmpl.id;

                return (
                  <div
                    key={tmpl.id}
                    className="p-4 rounded-2xl bg-surface border border-border space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-emerald-500" />
                        <h4 className="font-bold text-text text-sm">{tmpl.title}</h4>
                      </div>

                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingTemplateId(null)}
                            className="text-xs text-text-muted hover:text-text font-semibold"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveTemplate(tmpl.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                          >
                            <Save className="h-3.5 w-3.5" />
                            <span>Simpan Template</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartEditTemplate(tmpl)}
                          className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5 text-amber-500" />
                          <span>Edit Teks</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <textarea
                        rows={7}
                        value={templateContent}
                        onChange={(e) => setTemplateContent(e.target.value)}
                        className="w-full rounded-xl border border-emerald-500/40 bg-surface-2 p-3 font-mono text-xs text-text outline-hidden focus:border-emerald-500"
                      />
                    ) : (
                      <div className="p-3.5 rounded-xl bg-surface-2 border border-border font-mono text-[11px] whitespace-pre-wrap leading-relaxed text-text">
                        {tmpl.templateText || (tmpl as any).template}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            Tutup Pusat WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
