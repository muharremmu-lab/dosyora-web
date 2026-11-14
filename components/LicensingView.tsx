'use client';

import React, { useState } from 'react';

export default function LicensingView() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    taxNumber: '',
    taxOffice: '',
    address: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/license-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? 'Bildirim gönderilemedi.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-slate-50 min-h-screen">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Dosyora Kurumsal Lisans ve Ödeme</h1>
        <p className="text-slate-600">Yapay Zekâ Destekli Belge Okuma, Arşivleme ve Muhasebe Entegrasyonu</p>
      </div>

      {/* Yerel Veri Depolama Uyarısı */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="text-amber-500 text-xl font-bold">⚠️</div>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Veri Gizliliği ve Yerel Depolama Güvencesi</h3>
            <p className="text-sm text-amber-700 mt-1">
              Dosyora altyapısında işlenen tüm PDF dosyaları ve hassas belgeler, harici sunucularda saklanmaz; 
              tamamen kullanıcıların kendi yerel bilgisayarlarında güvenli bir şekilde depolanır.
            </p>
          </div>
        </div>
      </div>

      {/* Paket ve Banka Bilgileri Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
              Yıllık Kurumsal Paket
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-4">Dosyora Pro Sınırsız</h2>
            <p className="text-slate-500 text-sm mt-1">Sınırsız belge okuma, OCR, akıllı arşivleme ve muhasebe aktarımı.</p>
            <div className="mt-6 space-y-2 text-sm text-slate-700">
              <div className="flex items-center space-x-2"><span>✓</span> <span>1 Yıllık Kesintisiz Lisans Süresi</span></div>
              <div className="flex items-center space-x-2"><span>✓</span> <span>Otomatik Güncellemeler ve Öncelikli Destek</span></div>
              <div className="flex items-center space-x-2"><span>✓</span> <span>Yıllık Taahhüt ve Sözleşme Koşulları Geçerlidir</span></div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-3xl font-extrabold text-slate-900">499 TL <span className="text-sm font-normal text-slate-500">/ ay (Yıllık Faturalandırılır)</span></div>
          </div>
        </div>

        <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-indigo-100 mb-4">Banka Havale / EFT Bilgileri</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-indigo-300 text-xs">Alıcı Adı / Unvanı</span>
                <span className="font-medium text-lg">Ege Mutlu</span>
              </div>
              <div>
                <span className="block text-indigo-300 text-xs">IBAN Numarası</span>
                <div className="flex items-center justify-between bg-indigo-800 p-2.5 rounded mt-1">
                  <span className="font-mono tracking-wider font-semibold">TR17 0006 2001 1810 0006 5942 93</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-indigo-300 mt-6">
            * Havale açıklama kısmına kurumsal e-posta adresinizi veya TCKN/VKN bilginizi yazmanız işlemin onay süresini hızlandıracaktır.
          </p>
        </div>
      </div>

      {/* Fatura Formu */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Fatura ve İletişim Bilgileri Bildirim Formu</h3>
        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-lg text-center">
            <h4 className="font-semibold text-lg">Bildiriminiz Alındı!</h4>
            <p className="text-sm mt-1">Ödemeniz kontrol edildikten sonra faturanız kesilecek ve lisansınız aktif edilecektir.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ad Soyad / Şirket Unvanı</label>
                <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Örn: Mutlu Teknoloji A.Ş." />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">E-posta Adresi</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="ornek@sirket.com" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">TCKN veya Vergi Kimlik Numarası (VKN)</label>
                <input type="text" required value={formData.taxNumber} onChange={(e) => setFormData({...formData, taxNumber: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="10 veya 11 haneli numara" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Vergi Dairesi</label>
                <input type="text" required value={formData.taxOffice} onChange={(e) => setFormData({...formData, taxOffice: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Örn: Davutpaşa V.D." />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Fatura Adresi</label>
              <textarea rows={2} required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Açık adres ve il/ilçe bilgisi" />
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <button type="submit" disabled={loading} className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition shadow-md text-sm disabled:opacity-60">
              {loading ? 'Gönderiliyor...' : 'Havale Bildiriminde Bulun ve Fatura Bilgilerini Gönder'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
