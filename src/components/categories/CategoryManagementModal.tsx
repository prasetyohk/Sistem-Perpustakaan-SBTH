'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Tag,
  Plus,
  Trash2,
  Edit3,
  RotateCcw,
  Check,
  BookOpen,
  Star,
  Leaf,
  Heart,
  Sparkles,
  Save,
  HelpCircle,
} from 'lucide-react';
import { Category } from '@/types';
import { CATEGORIES } from '@/lib/constants';
import { libraryStore } from '@/lib/storage';
import { soundFx } from '@/lib/sound';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesUpdated?: () => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
  onCategoriesUpdated,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [colorHex, setColorHex] = useState('#F59E0B');
  const [iconName, setIconName] = useState('BookOpen');
  const [shelfLocation, setShelfLocation] = useState('Rak A - Baris 1');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCategories(libraryStore.getCategories());
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setShortName('');
    setColorHex('#F59E0B');
    setIconName('BookOpen');
    setShelfLocation('Rak A - Baris 1');
    setDescription('');
    setEditingId(null);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setShortName(cat.shortName || cat.name.slice(0, 10).toUpperCase());
    setColorHex(cat.colorHex || '#F59E0B');
    setIconName(cat.iconName || 'BookOpen');
    setShelfLocation(cat.shelfLocation || 'Rak Utama');
    setDescription(cat.description || '');
    soundFx.playScanBeep();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama Kategori wajib diisi.');
      return;
    }

    const badgeBg = 'bg-surface-2';
    const badgeBorder = 'border-border';
    const badgeText = 'text-text';

    if (editingId) {
      libraryStore.updateCategory(editingId, {
        name: name.trim(),
        shortName: (shortName.trim() || name.trim().slice(0, 10)).toUpperCase(),
        colorHex,
        iconName,
        shelfLocation: shelfLocation.trim(),
        description: description.trim(),
      });
      soundFx.playSuccessChime();
    } else {
      libraryStore.addCategory({
        name: name.trim(),
        shortName: (shortName.trim() || name.trim().slice(0, 10)).toUpperCase(),
        colorHex,
        badgeBg,
        badgeBorder,
        badgeText,
        iconName,
        shelfLocation: shelfLocation.trim(),
        description: description.trim(),
      });
      soundFx.playSuccessChime();
    }

    setCategories(libraryStore.getCategories());
    resetForm();
    if (onCategoriesUpdated) onCategoriesUpdated();
  };

  const handleDelete = (id: string, catName: string) => {
    if (confirm(`Yakin ingin menghapus kategori "${catName}"?`)) {
      const ok = libraryStore.deleteCategory(id);
      if (ok) {
        setCategories(libraryStore.getCategories());
        soundFx.playScanBeep();
        if (onCategoriesUpdated) onCategoriesUpdated();
      } else {
        alert('Minimal harus ada 1 kategori di sistem.');
      }
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan seluruh kategori dan warna stiker ke data resmi bawaan SBTH?')) {
      libraryStore.saveCategories(CATEGORIES);
      setCategories(CATEGORIES);
      resetForm();
      soundFx.playSuccessChime();
      if (onCategoriesUpdated) onCategoriesUpdated();
    }
  };

  const AVAILABLE_ICONS = [
    { id: 'BookOpen', label: 'Buku Terbuka', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'Star', label: 'Bintang / Fabel', icon: <Star className="h-4 w-4" /> },
    { id: 'Leaf', label: 'Daun / Sains Alam', icon: <Leaf className="h-4 w-4" /> },
    { id: 'Heart', label: 'Hati / Karakter', icon: <Heart className="h-4 w-4" /> },
    { id: 'Sparkles', label: 'Kilau / Spesial', icon: <Sparkles className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-surface border border-border p-6 shadow-2xl space-y-5 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-text">
                Kelola Kategori, Warna Punggung & Ikon Buku
              </h3>
              <p className="text-xs text-text-muted">
                Atur nama klasifikasi, kode singkatan punggung buku, warna stiker, dan ikon
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-text-muted hover:text-amber-500 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Reset ke Kategori Bawaan"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset Default</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-text-muted hover:text-text hover:bg-surface-2 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          {/* Form Tambah/Edit */}
          <form
            onSubmit={handleSave}
            className="p-4 rounded-2xl bg-surface-2 border border-border space-y-3"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-text text-sm flex items-center gap-2">
                <Tag className="h-4 w-4 text-amber-500" />
                <span>{editingId ? 'Edit Kategori Buku' : 'Tambah Kategori Buku Baru'}</span>
              </h4>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-rose-500 hover:underline font-semibold"
                >
                  Batal Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  Nama Kategori <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Dongeng & Fabel"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text font-bold outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  Singkatan Punggung Buku:
                </label>
                <input
                  type="text"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value.toUpperCase())}
                  placeholder="Contoh: DONGENG"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text font-mono font-bold outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  Warna Punggung / Label:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="h-8 w-10 rounded-lg cursor-pointer border border-border bg-transparent p-0.5"
                  />
                  <input
                    type="text"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-surface px-2.5 py-2 text-xs font-mono font-bold text-text outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  Pilih Ikon Visual:
                </label>
                <select
                  value={iconName}
                  onChange={(e) => setIconName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-hidden"
                >
                  {AVAILABLE_ICONS.map((ic) => (
                    <option key={ic.id} value={ic.id}>
                      {ic.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  Posisi Rak Default:
                </label>
                <input
                  type="text"
                  value={shelfLocation}
                  onChange={(e) => setShelfLocation(e.target.value)}
                  placeholder="Contoh: Rak A - Baris 1 s/d 4"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-text-muted block mb-1">
                  Deskripsi Kategori:
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan jenis buku yang masuk kategori ini..."
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text outline-hidden"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{editingId ? 'Simpan Perubahan Kategori' : 'Tambahkan Kategori'}</span>
              </button>
            </div>
          </form>

          {/* Daftar Kategori */}
          <div className="space-y-2">
            <h4 className="font-bold text-text text-sm">
              Daftar Kategori Tersedia ({categories.length} Kategori):
            </h4>
            <div className="rounded-2xl border border-border overflow-hidden bg-surface shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-2 text-text-muted border-b border-border font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Warna & Nama</th>
                    <th className="py-2.5 px-3">Kode Punggung</th>
                    <th className="py-2.5 px-3">Ikon</th>
                    <th className="py-2.5 px-3">Posisi Rak Default</th>
                    <th className="py-2.5 px-3">Deskripsi</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-surface-2/60 transition">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-4 w-4 rounded-full shrink-0 shadow-xs"
                            style={{ backgroundColor: cat.colorHex }}
                          />
                          <span className="font-bold text-text">{cat.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className="px-2 py-0.5 rounded-md font-mono font-bold text-[11px]"
                          style={{
                            backgroundColor: `${cat.colorHex}20`,
                            color: cat.colorHex,
                          }}
                        >
                          {cat.shortName || cat.name.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-text-muted">
                        <span className="inline-flex items-center gap-1 font-medium">
                          {cat.iconName || 'BookOpen'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-text-muted">{cat.shelfLocation || '-'}</td>
                      <td className="py-2.5 px-3 text-text-muted truncate max-w-[200px]">
                        {cat.description || '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10 transition"
                            title="Edit Kategori Ini"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id, cat.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition"
                            title="Hapus Kategori Ini"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
