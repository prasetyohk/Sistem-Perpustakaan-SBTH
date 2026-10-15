'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  GraduationCap,
  Sparkles,
  School,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
  Award,
  BookOpen,
  CreditCard,
  Printer,
  X,
  LayoutGrid,
  List as ListIcon,
  MessageSquare,
  Trash2,
} from 'lucide-react';
import { Member, MemberType, GradeLevel } from '@/types';
import { libraryStore } from '@/lib/storage';
import { BarcodeSvg } from '@/components/common/BarcodeSvg';
import { soundFx } from '@/lib/sound';
import { DICTIONARY } from '@/lib/i18n';
import { PageHeader } from '@/components/common/PageHeader';
import { Avatar } from '@/components/common/Avatar';
import { SmartBookCover } from '@/components/common/SmartBookCover';

interface MemberManagementProps {
  onRefresh?: () => void;
}

export const MemberManagement: React.FC<MemberManagementProps> = ({ onRefresh }) => {
  const currentLang = libraryStore.getLanguage();
  const t = DICTIONARY[currentLang];

  const [search, setSearch] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | GradeLevel | 'CLASSROOM'>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState<boolean>(false);
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);
  const [selectedMemberForLoans, setSelectedMemberForLoans] = useState<Member | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // New member form
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<MemberType>('STUDENT');
  const [gradeLevel, setGradeLevel] = useState<GradeLevel>('TK_A');
  const [classLetter, setClassLetter] = useState<string>('A');
  const [academicYear, setAcademicYear] = useState<string>('2025/2026');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [parentName, setParentName] = useState<string>('');
  const [parentPhone, setParentPhone] = useState<string>('');

  // Transition form state
  const [fromYear, setFromYear] = useState<string>('2025/2026');
  const [toYear, setToYear] = useState<string>('2026/2027');
  const [transitionResult, setTransitionResult] = useState<{
    promotedCount: number;
    graduatedCount: number;
  } | null>(null);

  const members = libraryStore.getMembers();
  const allLoans = libraryStore.getLoans();

  // Extract available academic years for filter dropdown
  const availableYears = Array.from(
    new Set(members.map((m) => m.academicYear).filter(Boolean))
  ) as string[];

  const filteredMembers = members.filter((m) => {
    if (selectedFilter !== 'ALL') {
      if (selectedFilter === 'CLASSROOM') {
        if (m.type !== 'CLASSROOM') return false;
      } else if (selectedFilter === 'TEACHER') {
        if (m.type !== 'TEACHER') return false;
      } else {
        if (m.gradeLevel !== selectedFilter) return false;
      }
    }

    if (selectedYear !== 'ALL' && m.academicYear !== selectedYear) {
      return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.memberCode.toLowerCase().includes(q) ||
        m.classGroup.toLowerCase().includes(q) ||
        (m.academicYear && m.academicYear.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getActiveLoansCount = (memberId: string) => {
    const memberLoans = allLoans.filter((l) => l.memberId === memberId && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));
    return memberLoans.reduce((acc, l) => acc + l.items.length, 0);
  };

  const handleDeleteMember = (member: Member) => {
    const activeCount = getActiveLoansCount(member.id);
    if (activeCount > 0) {
      alert(
        `PERINGATAN: Tidak dapat menghapus/menutup akun "${member.name}"!\n\n` +
        `Anggota ini masih memiliki ${activeCount} buku perpustakaan yang belum dikembalikan.\n` +
        `Silakan proses pengembalian buku terlebih dahulu di tab Sirkulasi.`
      );
      return;
    }

    if (
      confirm(
        `Tutup akun dan hapus keanggotaan:\n"${member.name}" (${member.classGroup})?\n\n` +
        `Tindakan ini akan menghapus akun perpustakaan siswa (misal setelah naik kelas / pindah sekolah).`
      )
    ) {
      libraryStore.deleteMember(member.id);
      soundFx.playScanBeep();
      setRefreshTrigger((prev) => prev + 1);
      if (onRefresh) onRefresh();
    }
  };

  const handleReturnBookFromModal = (barcode: string) => {
    libraryStore.returnBookItem(barcode, 'GOOD');
    soundFx.playSuccessChime();
    setRefreshTrigger((prev) => prev + 1);
    if (onRefresh) onRefresh();
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalClassGroup = '';
    if (type === 'STUDENT') {
      const levelLabel =
        gradeLevel === 'TODDLER'
          ? 'Toddler'
          : gradeLevel === 'NURSERY'
          ? 'Nursery'
          : gradeLevel === 'TK_A'
          ? 'TK-A'
          : gradeLevel === 'TK_B'
          ? 'TK-B'
          : 'Alumni';
      finalClassGroup = `${levelLabel} ${classLetter}`;
    } else if (type === 'TEACHER') {
      finalClassGroup = `Guru & Tenaga Pendidik`;
    } else {
      finalClassGroup = `Pojok Baca Kelas ${classLetter}`;
    }

    const maxLoans = type === 'CLASSROOM' ? 15 : type === 'TEACHER' ? 10 : 2;

    libraryStore.addMember({
      name: name.trim(),
      type,
      gradeLevel: type === 'TEACHER' ? 'TEACHER' : gradeLevel,
      classLetter,
      classGroup: finalClassGroup,
      academicYear: academicYear.trim(),
      parentName: parentName.trim() || undefined,
      parentPhone: parentPhone.trim() || undefined,
      maxLoanLimit: maxLoans,
      photoUrl: photoUrl.trim() || '',
    });

    soundFx.playSuccessChime();
    setName('');
    setParentName('');
    setParentPhone('');
    setPhotoUrl('');
    setIsAddModalOpen(false);
    if (onRefresh) onRefresh();
    alert(`Anggota "${name}" berhasil ditambahkan dengan kuota ${maxLoans} buku.`);
  };

  const handleExecuteTransition = () => {
    if (!fromYear || !toYear) return;
    if (fromYear === toYear) {
      alert('Tahun ajaran asal dan tujuan tidak boleh sama.');
      return;
    }

    if (
      !confirm(
        `APAKAH ANDA YAKIN?\n\nSistem akan menaikkan kelas seluruh siswa aktif dari tahun ${fromYear} ke ${toYear}:\n• Toddler -> Nursery\n• Nursery -> TK-A\n• TK-A -> TK-B\n• TK-B -> Lulus (Arsip Alumni)\n\nData anggota lama dan riwayat pinjam tetap aman.`
      )
    ) {
      return;
    }

    const result = libraryStore.promoteAcademicYear(fromYear, toYear);
    soundFx.playSuccessChime();
    setTransitionResult(result);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header: Uniform Pattern with ONE Primary Amber Button */}
      <PageHeader
        icon={<Users className="h-5 w-5" />}
        title="Data Anggota & Kelas"
        subtitle="Kelola keanggotaan Toddler, Nursery, TK-A, TK-B, Guru, Pojok Baca Kelas, dan Arsip Alumni"
        actions={
          <>
            <button
              type="button"
              onClick={() => {
                setTransitionResult(null);
                setIsTransitionModalOpen(true);
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-surface border border-border hover:bg-surface-2 text-text font-semibold text-xs flex items-center justify-center gap-2 transition"
              title="Update dan roll-over naik kelas massal otomatis saat pergantian tahun ajaran baru"
            >
              <GraduationCap className="h-4 w-4 text-text-muted" />
              <span>Naik Kelas Massal</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              <span>Tambah Anggota</span>
            </button>
          </>
        }
      />

      {/* 2. Filter and Search Bar */}
      <div className="rounded-2xl bg-surface border border-border p-3.5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama siswa, kode anggota (SBTH-M-...), kelas, atau angkatan..."
              className="w-full rounded-xl border border-border bg-surface-2 pl-10 pr-4 py-2 text-xs text-text placeholder-text-muted outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Academic Year Filter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-2 border border-border text-xs">
              <span className="text-text-muted font-medium">Angkatan:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent border-none outline-hidden text-xs text-text cursor-pointer font-semibold"
              >
                <option value="ALL" className="bg-surface text-text">Semua Angkatan</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr} className="bg-surface text-text">
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Grid / Table Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-surface-2 border border-border">
              <button
                type="button"
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'GRID'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-text-muted hover:text-text'
                }`}
                title="Tampilan Grid"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'TABLE'
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'text-text-muted hover:text-text'
                }`}
                title="Tampilan Tabel"
              >
                <ListIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Level Switcher Pills without double emojis */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
          {[
            { id: 'ALL', label: 'Semua Anggota' },
            { id: 'TODDLER', label: 'Toddler' },
            { id: 'NURSERY', label: 'Nursery' },
            { id: 'TK_A', label: 'TK-A' },
            { id: 'TK_B', label: 'TK-B' },
            { id: 'TEACHER', label: 'Guru & Staff' },
            { id: 'CLASSROOM', label: 'Pojok Baca' },
            { id: 'ALUMNI', label: 'Arsip Alumni (Lulus)' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedFilter(item.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedFilter === item.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-surface-2 text-text-muted hover:text-text'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Member Presentation: Grid Mode or Table Mode */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const activeLoansCount = getActiveLoansCount(member.id);
            const loanPct = Math.min(100, Math.round((activeLoansCount / member.maxLoanLimit) * 100));

            return (
              <div
                key={member.id}
                className="rounded-2xl bg-surface border border-border p-4 sm:p-5 shadow-xs hover:border-border/80 transition flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3.5">
                  <Avatar
                    name={member.name}
                    src={member.photoUrl}
                    size="md"
                    shape="circle"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-surface-2 text-text-muted font-mono text-[10px] font-bold border border-border">
                        {member.memberCode}
                      </span>
                      {member.status === 'GRADUATED' ? (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 text-[10px] font-semibold">
                          Alumni (Lulus)
                        </span>
                      ) : member.type === 'TEACHER' ? (
                        <span className="px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-500 text-[10px] font-semibold">
                          Guru
                        </span>
                      ) : member.type === 'CLASSROOM' ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-500 text-[10px] font-semibold">
                          Pojok Baca
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 text-[10px] font-semibold">
                          {member.gradeLevel}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-text mt-1 truncate">
                      {member.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {member.classGroup}
                      {member.academicYear ? (
                        <span className="ml-1 text-text-muted/70 font-normal">
                          ({member.academicYear})
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>

                {/* Quota Progress Bar (dipinjam / kuota) */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-muted font-medium">Buku Dipinjam:</span>
                    <button
                      type="button"
                      onClick={() => setSelectedMemberForLoans(member)}
                      className="font-semibold text-text hover:text-amber-500 flex items-center gap-1 transition cursor-pointer"
                      title="Klik untuk melihat judul buku yang dipinjam"
                    >
                      <BookOpen className="h-3 w-3 text-amber-500" />
                      <span>{activeLoansCount} / {member.maxLoanLimit} Buku</span>
                      {activeLoansCount > 0 && (
                        <span className="text-[10px] text-amber-500 underline font-normal">(Lihat)</span>
                      )}
                    </button>
                  </div>
                  <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden border border-border">
                    <div
                      className={`h-full transition-all duration-300 ${
                        loanPct >= 100
                          ? 'bg-rose-500'
                          : loanPct > 0
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${loanPct}%` }}
                    />
                  </div>
                </div>

                {/* Card Footer: WhatsApp Button + View Student Card Button + Delete Button */}
                <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-text-muted">
                  <div className="truncate">
                    {member.parentPhone ? (
                      <a
                        href={`https://wa.me/${member.parentPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=Halo%20Bunda%2FAyah%20dari%20${encodeURIComponent(member.name)}%2C%20terkait%20perpustakaan%20SBTH%20TK.`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-emerald-500 hover:underline font-mono text-[11px]"
                        title="Chat WhatsApp Orang Tua / Wali"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{member.parentPhone}</span>
                      </a>
                    ) : (
                      <span className="text-text-muted text-[11px]">-</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedMemberForCard(member)}
                      className="px-2 py-1 rounded-lg border border-border bg-surface-2 hover:bg-surface text-text font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Cetak Kartu Siswa"
                    >
                      <CreditCard className="h-3 w-3 text-amber-500" />
                      <span>Kartu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member)}
                      className="p-1.5 rounded-lg border border-border bg-surface-2 text-text-muted hover:text-rose-500 hover:border-rose-500/40 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Tutup / Hapus Akun Siswa (setelah naik kelas / pindah)"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2 text-text-muted border-b border-border sticky top-0 font-semibold">
                <tr>
                  <th className="py-3 px-4">Anggota</th>
                  <th className="py-3 px-4">Kode Barcode</th>
                  <th className="py-3 px-4">Kelas & Angkatan</th>
                  <th className="py-3 px-4">Status & Kuota</th>
                  <th className="py-3 px-4">Kontak Wali</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((member) => {
                  const activeLoansCount = getActiveLoansCount(member.id);

                  return (
                    <tr key={member.id} className="hover:bg-surface-2/60 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            name={member.name}
                            src={member.photoUrl}
                            size="sm"
                            shape="circle"
                          />
                          <span className="font-semibold text-text">{member.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-text-muted">
                        {member.memberCode}
                      </td>
                      <td className="py-3 px-4 text-text">
                        {member.classGroup} ({member.academicYear})
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setSelectedMemberForLoans(member)}
                          className="font-medium text-text hover:text-amber-500 flex items-center gap-1.5 transition cursor-pointer"
                          title="Klik untuk melihat buku yang sedang dipinjam"
                        >
                          <BookOpen className="h-3.5 w-3.5 text-amber-500" />
                          <span>{activeLoansCount} / {member.maxLoanLimit} Dipinjam</span>
                          {activeLoansCount > 0 && <span className="text-[10px] text-amber-500 underline font-normal">(Detail)</span>}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        {member.parentPhone ? (
                          <a
                            href={`https://wa.me/${member.parentPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-500 hover:underline font-mono"
                          >
                            {member.parentPhone}
                          </a>
                        ) : (
                          <span className="text-text-muted">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedMemberForCard(member)}
                            className="px-2.5 py-1 rounded-lg border border-border bg-surface-2 hover:bg-surface text-text font-semibold text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                            title="Cetak Kartu Siswa"
                          >
                            <CreditCard className="h-3 w-3 text-amber-500" />
                            <span>Kartu</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member)}
                            className="p-1 rounded-lg border border-border bg-surface-2 text-text-muted hover:text-rose-500 hover:border-rose-500/40 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Tutup / Hapus Akun Siswa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredMembers.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-text-muted">
          <Users className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold text-text">
            Tidak ada data anggota yang cocok dengan filter.
          </p>
        </div>
      )}

      {/* 4. MODAL: PREVIEW KARTU PERPUSTAKAAN ANAK (LUCU & SIAP CETAK) */}
      {selectedMemberForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-surface shadow-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-text flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-500" />
                <span>Kartu Pustaka Siswa</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedMemberForCard(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cute Child ID Card Design */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-4 text-white shadow-lg space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black tracking-tight uppercase">
                    SBTH Magelang
                  </h4>
                  <p className="text-[9px] text-amber-100">
                    Kartu Anggota Perpustakaan
                  </p>
                </div>
                <Sparkles className="h-4 w-4 text-amber-200" />
              </div>

              <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
                <Avatar
                  name={selectedMemberForCard.name}
                  src={selectedMemberForCard.photoUrl}
                  size="md"
                  shape="circle"
                />
                <div className="min-w-0">
                  <h5 className="text-sm font-bold truncate leading-tight">
                    {selectedMemberForCard.name}
                  </h5>
                  <p className="text-[10px] text-amber-100 mt-0.5">
                    {selectedMemberForCard.classGroup}
                  </p>
                  <span className="inline-block mt-0.5 font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/25">
                    {selectedMemberForCard.memberCode}
                  </span>
                </div>
              </div>

              {/* Scannable Barcode SVG */}
              <div className="bg-white rounded-xl p-2.5 flex flex-col items-center shadow-xs">
                <BarcodeSvg
                  value={selectedMemberForCard.memberCode}
                  width={1.3}
                  height={32}
                  fontSize={9}
                  textMargin={1}
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-border">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface border border-border text-text font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Cetak Kartu</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMemberForCard(null)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4.5 MODAL: BUKU YANG SEDANG DIPINJAM OLEH ANGGOTA */}
      {selectedMemberForLoans && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-surface shadow-2xl border border-border p-5 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar
                  name={selectedMemberForLoans.name}
                  src={selectedMemberForLoans.photoUrl}
                  size="md"
                  shape="circle"
                />
                <div>
                  <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
                    <span>{selectedMemberForLoans.name}</span>
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">
                    {selectedMemberForLoans.classGroup} • Kode: {selectedMemberForLoans.memberCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMemberForLoans(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {(() => {
                const memberLoans = allLoans.filter(
                  (l) =>
                    l.memberId === selectedMemberForLoans.id &&
                    (l.status === 'ACTIVE' || l.status === 'OVERDUE')
                );
                const today = new Date().toISOString().split('T')[0];

                if (memberLoans.length === 0) {
                  return (
                    <div className="rounded-xl border border-dashed border-border p-8 text-center space-y-2">
                      <BookOpen className="h-8 w-8 text-emerald-500 mx-auto" />
                      <h4 className="text-sm font-bold text-text">Tidak Ada Buku yang Dipinjam</h4>
                      <p className="text-xs text-text-muted">
                        Siswa ini saat ini tidak memiliki tanggungan peminjaman buku. Siap meminjam hingga {selectedMemberForLoans.maxLoanLimit} buku.
                      </p>
                    </div>
                  );
                }

                return memberLoans.map((loan) => (
                  <div key={loan.id} className="space-y-2">
                    {loan.items.filter((li) => !li.returnDate).map((loanItem) => {
                      const barcode = loanItem.itemBarcode;
                      const item = libraryStore.findItemByBarcode(barcode);
                      const book = item ? libraryStore.getBooks().find((b) => b.id === item.bookId) : null;
                      const isOverdue = loan.dueDate < today;

                      return (
                        <div
                          key={loanItem.id || barcode}
                          className="rounded-xl border border-border bg-surface-2/60 p-3.5 flex items-start justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="h-16 w-11 rounded-lg overflow-hidden shrink-0 border border-border bg-surface shadow-2xs">
                              <SmartBookCover
                                title={book?.title || loanItem.bookTitle || 'Buku Perpustakaan'}
                                author={book?.author}
                                coverUrl={book?.coverImage}
                                categoryId={book?.categoryId}
                                aspectRatio="h-full w-full"
                              />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-text truncate">
                                {book?.title || loanItem.bookTitle || 'Buku Perpustakaan'}
                              </h5>
                              <p className="text-[11px] text-text-muted truncate">
                                {book?.author || 'Penulis SBTH'} • {book?.publisher || 'Penerbit'}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                <span className="text-[10px] font-mono font-bold text-text bg-surface px-1.5 py-0.5 rounded border border-border">
                                  {barcode}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    isOverdue
                                      ? 'bg-rose-500/15 text-rose-500'
                                      : 'bg-emerald-500/15 text-emerald-500'
                                  }`}
                                >
                                  {isOverdue ? `Terlambat (Jatuh tempo: ${loan.dueDate})` : `Batas: ${loan.dueDate}`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Kembalikan buku "${book?.title || barcode}" sekarang?`)) {
                                handleReturnBookFromModal(barcode);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] shadow-xs shrink-0 transition cursor-pointer"
                          >
                            Kembalikan
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
              <span className="text-[11px] text-text-muted">
                Total Pinjaman: {getActiveLoansCount(selectedMemberForLoans.id)} / {selectedMemberForLoans.maxLoanLimit} Buku
              </span>
              <button
                type="button"
                onClick={() => setSelectedMemberForLoans(null)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: TAMBAH ANGGOTA BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-surface shadow-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-text flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-amber-500" />
                <span>Tambah Anggota Perpustakaan</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">
                  Nama Lengkap Siswa / Guru:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Rayyan Althaf"
                  className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Tipe Keanggotaan:
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text outline-hidden"
                  >
                    <option value="STUDENT">Siswa</option>
                    <option value="TEACHER">Guru & Staff</option>
                    <option value="CLASSROOM">Pojok Baca Kelas</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Jenjang / Kelompok:
                  </label>
                  <select
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value as any)}
                    disabled={type === 'TEACHER'}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text outline-hidden disabled:opacity-50"
                  >
                    <option value="TODDLER">Toddler</option>
                    <option value="NURSERY">Nursery</option>
                    <option value="TK_A">TK-A</option>
                    <option value="TK_B">TK-B</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Kelas / Rombel:
                  </label>
                  <select
                    value={classLetter}
                    onChange={(e) => setClassLetter(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text outline-hidden"
                  >
                    <option value="A">Kelas A</option>
                    <option value="B">Kelas B</option>
                    <option value="C">Kelas C</option>
                    <option value="D">Kelas D</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Tahun Ajaran / Angkatan:
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2025/2026"
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Nama Wali / Kontak:
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Contoh: Ibu Rina"
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    No. WhatsApp Wali:
                  </label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-text placeholder-text-muted focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-text-muted rounded-xl hover:bg-surface-2 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition"
                >
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: TRANSISI TAHUN AJARAN BARU & NAIK KELAS MASSAL */}
      {isTransitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-surface shadow-2xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text">
                  {t.academicYearTransition}
                </h3>
                <p className="text-xs text-text-muted">
                  Pergantian tahun ajaran otomatis tanpa repot & tanpa menghapus data alumni
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-surface-2 p-4 border border-border space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Tahun Ajaran Saat Ini
                  </label>
                  <input
                    type="text"
                    value={fromYear}
                    onChange={(e) => setFromYear(e.target.value)}
                    placeholder="Contoh: 2025/2026"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-mono font-bold text-text outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">
                    Target Tahun Ajaran Baru
                  </label>
                  <input
                    type="text"
                    value={toYear}
                    onChange={(e) => setToYear(e.target.value)}
                    placeholder="Contoh: 2026/2027"
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-mono font-bold text-amber-500 outline-hidden"
                  />
                </div>
              </div>
            </div>

            {transitionResult && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500 space-y-1">
                <p className="font-bold">✓ Transisi Berhasil Dilakukan!</p>
                <p>
                  • {transitionResult.promotedCount} siswa berhasil naik ke tingkat berikutnya.
                </p>
                <p>
                  • {transitionResult.graduatedCount} siswa TK-B berhasil diluluskan dan diarsipkan sebagai Alumni.
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
              <button
                type="button"
                onClick={() => setIsTransitionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-text-muted rounded-xl hover:bg-surface-2 transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleExecuteTransition}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition"
              >
                Jalankan Transisi Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
