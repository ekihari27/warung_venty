"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/dashboard/stat-card";
import { updateStoreSettings } from "@/actions/settings";
import { Store, Printer, QrCode, Percent, Loader2, Save, ImageIcon } from "lucide-react";

interface SettingsData {
  storeName: string;
  logo: string | null;
  address: string | null;
  phone: string | null;
  qrisImage: string | null;
  receiptFooter: string | null;
  defaultTax: number;
}

export function SettingsClient({ settings }: { settings: SettingsData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [storeName, setStoreName] = useState(settings.storeName);
  const [address, setAddress] = useState(settings.address || "");
  const [phone, setPhone] = useState(settings.phone || "");
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter || "");
  const [defaultTax, setDefaultTax] = useState(settings.defaultTax.toString());
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo);
  const [qrisPreview, setQrisPreview] = useState<string | null>(settings.qrisImage);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [qrisBase64, setQrisBase64] = useState<string | null>(null);

  const handleImageFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (v: string | null) => void,
    setBase64: (v: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setBase64(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateStoreSettings({
          storeName,
          address,
          phone,
          receiptFooter,
          defaultTax: parseFloat(defaultTax) || 0,
          logoBase64: logoBase64 || undefined,
          qrisBase64: qrisBase64 || undefined,
        });
        router.refresh();
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal menyimpan pengaturan");
      }
    });
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Pengaturan Toko" description="Kelola informasi dan konfigurasi toko" />

      <div className="grid gap-4 xl:grid-cols-4 mb-6 max-w-5xl">
        <StatCard title="Pajak Default" value={`${settings.defaultTax}%`} icon={Percent} color="blue" isString />
        <StatCard title="Status QRIS" value={settings.qrisImage ? "Diatur" : "Belum"} icon={QrCode} color={settings.qrisImage ? "emerald" : "amber"} isString />
        <StatCard title="Logo Toko" value={settings.logo ? "Tersedia" : "Belum"} icon={ImageIcon} color={settings.logo ? "emerald" : "amber"} isString />
        <StatCard title="Nama Toko" value={settings.storeName || "-"} icon={Store} color="purple" isString />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
        {/* Store Info */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Store className="w-5 h-5" />Informasi Toko</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Nama Toko</Label><Input value={storeName} onChange={(e) => setStoreName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Alamat</Label><Textarea value={address} onChange={(e) => setAddress(e.target.value)} /></div>
            <div className="space-y-2"><Label>Telepon</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Logo Toko</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleImageFile(e, setLogoPreview, setLogoBase64)} />
              {logoPreview && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Receipt & Tax */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Printer className="w-5 h-5" />Struk & Pajak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Footer Struk</Label><Textarea value={receiptFooter} onChange={(e) => setReceiptFooter(e.target.value)} placeholder="Terima Kasih atas Kunjungan Anda!" /></div>
            <div className="space-y-2">
              <Label>Pajak Default (%)</Label>
              <Input type="number" min="0" max="100" step="0.1" value={defaultTax} onChange={(e) => setDefaultTax(e.target.value)} />
              <p className="text-xs text-slate-500">Masukkan 0 jika tidak ada pajak. Contoh: 11 untuk PPN 11%</p>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><QrCode className="w-4 h-4" />QRIS Toko</Label>
              <Input type="file" accept="image/*" onChange={(e) => handleImageFile(e, setQrisPreview, setQrisBase64)} />
              {qrisPreview && (
                <div className="w-32 h-32 rounded-lg overflow-hidden border bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrisPreview} alt="QRIS" className="w-full h-full object-contain" />
                </div>
              )}
              <p className="text-xs text-slate-500">Upload gambar QRIS untuk ditampilkan saat pembayaran</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 max-w-4xl">
        <Button onClick={handleSave} disabled={isPending} className="px-8">
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
}
