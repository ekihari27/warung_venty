"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { useCartStore } from "@/store/cart-store";
import { searchPosProducts, createTransaction } from "@/actions/pos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import {
  Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote,
  QrCode, Printer, Loader2, ImageIcon, CheckCircle2, ScanLine,
} from "lucide-react";

interface SearchProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  sellingPrice: number;
  unit: string;
  image: string | null;
  stock: number;
}

interface TransactionResult {
  invoiceNumber: string;
  cashierName: string;
  totalPrice: number;
  tax: number;
  finalPrice: number;
  paidAmount: number;
  changeAmount: number;
  paymentMethod: string;
  items: { productId: string; qty: number; sellingPrice: number }[];
  createdAt?: string;
}

export function PosClient({ defaultTax, qrisImage, storeName, storeAddress, storePhone, receiptFooter }: {
  defaultTax: number;
  qrisImage: string | null;
  storeName: string;
  storeAddress: string | null;
  storePhone: string | null;
  receiptFooter: string | null;
}) {
  
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<TransactionResult | null>(null);
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS">("CASH");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { items, addItem, updateQty, removeItem, clearCart, getTotal } = useCartStore();
  const total = getTotal();
  const taxAmount = total * (defaultTax / 100);
  const finalPrice = total + taxAmount;

  // Debounced search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchPosProducts(query);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      }
      setSearching(false);
    }, 300);
  }, []);

  const handleAddProduct = (product: SearchProduct) => {
    addItem({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      image: product.image,
      sellingPrice: product.sellingPrice,
      unit: product.unit,
      maxStock: product.stock,
    });
    setSearchQuery("");
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const handlePayment = async () => {
    const paid = paymentMethod === "QRIS" ? finalPrice : parseFloat(paidAmount);
    if (paymentMethod === "CASH" && (!paid || paid < finalPrice)) {
      alert("Nominal pembayaran kurang!");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createTransaction({
          items: items.map((i) => ({
            productId: i.productId,
            qty: i.qty,
            sellingPrice: i.sellingPrice,
          })),
          paymentMethod,
          paymentStatus: "PAID",
          paidAmount: paid,
          tax: defaultTax,
        });

        // Build cart items for receipt
        const receiptItems = items.map((i) => ({
          productId: i.productId,
          name: i.name,
          qty: i.qty,
          sellingPrice: i.sellingPrice,
        }));

        setReceiptData({
          ...result,
          items: receiptItems,
          createdAt: new Date().toISOString(),
        } as TransactionResult);

        clearCart();
        setPaymentOpen(false);
        setPaidAmount("");
      } catch (err) {
        alert(err instanceof Error ? err.message : "Gagal memproses transaksi");
      }
    });
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const quickAmounts = [10000, 20000, 50000, 100000, 200000, 500000];
  const changeAmount = paymentMethod === "CASH" ? Math.max(0, (parseFloat(paidAmount) || 0) - finalPrice) : 0;

  return (
    <div className="animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[calc(100vh-10rem)]">
        {/* Left Panel - Product Search */}
        <div className="lg:col-span-3 flex flex-col">
          <Card className="border-none shadow-sm flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-4 shrink-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Kasir Cepat</p>
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold text-slate-950 dark:text-white">Cari produk dan tambahkan ke keranjang</h2>
                    <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                      Gunakan nama, SKU, atau barcode untuk menambahkan produk ke transaksi dengan cepat.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">Pajak {defaultTax}%</Badge>
                  <Badge variant="secondary">{items.length} produk</Badge>
                </div>
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  ref={searchInputRef}
                  placeholder="Cari produk (nama, SKU, barcode)..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="h-12 rounded-3xl border-slate-200 pl-11 shadow-sm"
                  autoFocus
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {searchQuery && (
                <div className="space-y-2">
                  {searching ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Search className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-30" />
                      <p className="text-sm">Produk tidak ditemukan</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleAddProduct(product)}
                          className="flex items-center gap-3 rounded-3xl border border-slate-200/80 bg-slate-50 p-4 text-left shadow-sm transition duration-200 hover:border-emerald-300 hover:bg-white hover:shadow-lg group"
                        >
                          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 overflow-hidden shrink-0 dark:bg-slate-900">
                            {product.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.sku}</p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900">
                                {formatCurrency(product.sellingPrice)}
                              </p>
                              <Badge variant={product.stock > 0 ? "success" : "destructive"} className="text-[10px]">
                                {product.stock} {product.unit}
                              </Badge>
                            </div>
                          </div>
                          <Plus className="w-5 h-5 text-slate-400 transition-colors group-hover:text-primary shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!searchQuery && (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
                  <ScanLine className="w-16 h-16 mb-4 text-slate-400" />
                  <p className="text-lg font-medium mb-1 text-slate-900">Cari Produk</p>
                  <p className="text-sm max-w-sm">
                    Ketik nama produk, SKU, atau scan barcode untuk mulai menambahkan ke keranjang
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Cart */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="border-none shadow-sm flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 shrink-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <ShoppingCart className="w-5 h-5" />
                  <CardTitle className="m-0 text-base font-semibold">Keranjang</CardTitle>
                  {items.length > 0 && (
                    <Badge className="text-sm">{items.length} item</Badge>
                  )}
                </div>
                {items.length > 0 && (
                  <Button variant="ghost" size="icon" onClick={() => clearCart()} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" aria-label="Bersihkan keranjang">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 pt-0">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
                  <ShoppingCart className="w-12 h-12 mb-3 text-slate-400" />
                  <p className="text-sm text-slate-700">Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 shadow-sm transition hover:border-emerald-300 dark:border-slate-800/80 dark:bg-slate-950">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate text-slate-950 dark:text-white">{item.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatCurrency(item.sellingPrice)} / {item.unit}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-9 w-9 p-0" onClick={() => updateQty(item.productId, item.qty - 1)} aria-label={`Kurangi jumlah ${item.name}`}>
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="min-w-[2rem] text-center text-sm font-semibold text-slate-950 dark:text-white">{item.qty}</span>
                          <Button variant="outline" size="icon" className="h-9 w-9 p-0" onClick={() => updateQty(item.productId, item.qty + 1)} aria-label={`Tambah jumlah ${item.name}`}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-sm font-semibold text-slate-950 dark:text-white">
                        <span>Total</span>
                        <span>{formatCurrency(item.sellingPrice * item.qty)}</span>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-rose-500" onClick={() => removeItem(item.productId)} aria-label={`Hapus ${item.name}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 shrink-0 space-y-3">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  {defaultTax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pajak ({defaultTax}%)</span>
                      <span>{formatCurrency(taxAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(finalPrice)}</span>
                  </div>
                </div>
                <Button
                  className="w-full h-12 text-base font-semibold"
                  onClick={() => setPaymentOpen(true)}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Bayar {formatCurrency(finalPrice)}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="text-center mb-6">
              <p className="text-sm text-slate-500">Total Pembayaran</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(finalPrice)}</p>
            </div>

            <Tabs defaultValue="CASH" onValueChange={(v) => setPaymentMethod(v as "CASH" | "QRIS")}>
              <TabsList className="w-full mb-4">
                <TabsTrigger value="CASH" className="flex-1"><Banknote className="w-4 h-4 mr-2" />Cash</TabsTrigger>
                <TabsTrigger value="QRIS" className="flex-1"><QrCode className="w-4 h-4 mr-2" />QRIS</TabsTrigger>
              </TabsList>

              <TabsContent value="CASH">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nominal Uang</Label>
                    <Input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      placeholder="Masukkan nominal"
                      className="h-12 text-lg text-center font-semibold"
                      autoFocus
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setPaidAmount(amount.toString())}
                        className="text-xs"
                      >
                        {formatCurrency(amount)}
                      </Button>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setPaidAmount(finalPrice.toString())}>
                    Uang Pas
                  </Button>
                  {parseFloat(paidAmount) >= finalPrice && (
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-center shadow-sm">
                      <p className="text-sm text-emerald-700">Kembalian</p>
                      <p className="text-2xl font-bold text-emerald-900">
                        {formatCurrency(changeAmount)}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="QRIS">
                <div className="text-center space-y-4">
                  {qrisImage ? (
                    <div className="inline-block p-4 bg-white rounded-3xl shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrisImage} alt="QRIS" className="w-48 h-48 object-contain" />
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center">
                      <QrCode className="mx-auto mb-2 h-16 w-16 text-slate-500" />
                      <p className="text-sm text-slate-500">QRIS belum diatur. Silakan upload di Pengaturan.</p>
                    </div>
                  )}
                  <p className="text-sm text-slate-500">
                    Scan QRIS untuk membayar {formatCurrency(finalPrice)}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Batal</Button>
            <Button onClick={handlePayment} disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Proses Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={!!receiptData} onOpenChange={() => setReceiptData(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Transaksi Berhasil
            </DialogTitle>
          </DialogHeader>

          {receiptData && (
            <div className="receipt-print">
              <div className="border rounded-lg p-4 text-center text-sm space-y-3 font-mono">
                <div>
                  <p className="font-bold text-lg">{storeName}</p>
                  {storeAddress && <p className="text-xs text-slate-500">{storeAddress}</p>}
                  {storePhone && <p className="text-xs text-slate-500">{storePhone}</p>}
                </div>
                <Separator />
                <div className="text-left text-xs space-y-1">
                  <p>No: {receiptData.invoiceNumber}</p>
                  <p>Kasir: {receiptData.cashierName}</p>
                  <p>Tanggal: {new Date(receiptData.createdAt || Date.now()).toLocaleString("id-ID")}</p>
                </div>
                <Separator />
                <div className="text-left text-xs space-y-1">
                  {receiptData.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate flex-1 mr-2">
                        {(item as { name?: string }).name || `Produk ${idx + 1}`} x{item.qty}
                      </span>
                      <span>{formatCurrency(item.sellingPrice * item.qty)}</span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="text-left text-xs space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(receiptData.totalPrice)}</span></div>
                  {receiptData.tax > 0 && <div className="flex justify-between"><span>Pajak</span><span>{formatCurrency(receiptData.tax)}</span></div>}
                  <div className="flex justify-between font-bold text-sm"><span>TOTAL</span><span>{formatCurrency(receiptData.finalPrice)}</span></div>
                  <div className="flex justify-between"><span>{receiptData.paymentMethod}</span><span>{formatCurrency(receiptData.paidAmount)}</span></div>
                  {receiptData.changeAmount > 0 && (
                    <div className="flex justify-between"><span>Kembali</span><span>{formatCurrency(receiptData.changeAmount)}</span></div>
                  )}
                </div>
                <Separator />
                <p className="text-xs text-slate-500">{receiptFooter || "Terima Kasih!"}</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReceiptData(null)}>Tutup</Button>
            <Button onClick={handlePrintReceipt}>
              <Printer className="w-4 h-4 mr-2" />Cetak Struk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
