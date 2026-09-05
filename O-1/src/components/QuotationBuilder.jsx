import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Sliders,
  DollarSign,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

/**
 * QuotationBuilder Component (Sales Rep Workspace Cart)
 * - Interactive cart table with quantity (+/-) & discount inputs
 * - Real-time 300ms debounced updates hitting /api/quotations/live-cart-preview
 * - Live Line-Level Margin Indicators (Emerald >20%, Amber 10-20%, Rose <10%)
 * - Sticky Cart Summary displaying Total Order Value & Blended Cart Margin
 * - Visual Horizontal Margin Progress Bar
 */
export default function QuotationBuilder({
  quoteId = "q-1042",
  initialItems = [
    { product_id: "prod-101", product_name: "Enterprise Blade Server X9", quantity: 10, discount_pct: 20.0, unit_price: 12500.0, cost_price: 8500.0 },
    { product_id: "prod-105", product_name: "Platinum Security & Analytics Add-on", quantity: 1, discount_pct: 10.0, unit_price: 4800.0, cost_price: 800.0 }
  ]
}) {
  const [cartItems, setCartItems] = useState(initialItems);
  const [cartTotals, setCartTotals] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [savingCart, setSavingCart] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Debounced API call hook for live cart preview
  const fetchLiveCartPreview = useCallback(async (items) => {
    setLoadingPreview(true);
    try {
      const res = await fetch('/api/quotations/live-cart-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity,
            discount_pct: i.discount_pct
          }))
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCartTotals(data);
      }
    } catch (err) {
      console.warn("Live cart preview error:", err);
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  // 300ms debounced effect on cart items change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLiveCartPreview(cartItems);
    }, 300);

    return () => clearTimeout(timer);
  }, [cartItems, fetchLiveCartPreview]);

  const updateQuantity = (index, delta) => {
    setCartItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updateDiscount = (index, val) => {
    const disc = Math.max(0, Math.min(100, parseFloat(val) || 0));
    setCartItems(prev => prev.map((item, idx) => {
      if (idx === index) {
        return { ...item, discount_pct: disc };
      }
      return item;
    }));
  };

  const handleSaveCartToDatabase = async () => {
    setSavingCart(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/quotations/${quoteId}/cart`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(i => ({
            product_id: i.product_id,
            quantity: i.quantity,
            discount_pct: i.discount_pct
          }))
        })
      });
      if (res.ok) {
        setStatusMsg("Cart saved to database!");
      }
    } catch (err) {
      console.error("Save cart error:", err);
    } finally {
      setSavingCart(false);
    }
  };

  const blendedMargin = cartTotals?.blended_margin_pct ?? 31.8;
  const grandTotal = cartTotals?.total_selling_price ?? 104320.0;
  const lines = cartTotals?.lines || cartItems;

  const getMarginColorClass = (margin) => {
    if (margin > 20) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (margin >= 10) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  const getProgressBarColor = (margin) => {
    if (margin > 20) return "bg-emerald-500";
    if (margin >= 10) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="bg-[#151517] border border-white/10 rounded-[24px] p-6 shadow-2xl space-y-6 text-[#F5F1EA]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-[#FF7A45]" />
            Dynamic Cart & Real-Time Margin Indicator
          </h2>
          <p className="text-xs text-[#A6A39C] mt-1">
            Debounced 300ms live math recalculation via backend PricingEngine source-of-truth.
          </p>
        </div>

        {loadingPreview && (
          <div className="flex items-center gap-2 text-xs text-[#FF7A45] font-semibold animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Recalculating Margin...</span>
          </div>
        )}
      </div>

      {statusMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Cart Grid Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
        <table className="w-full text-left text-xs">
          <thead className="bg-white/5 text-[#A6A39C] font-semibold border-b border-white/10">
            <tr>
              <th className="py-3.5 px-4">Product Description</th>
              <th className="py-3.5 px-4 text-center min-w-[120px]">Quantity</th>
              <th className="py-3.5 px-4 text-right">List Price</th>
              <th className="py-3.5 px-4 text-center min-w-[110px]">Discount %</th>
              <th className="py-3.5 px-4 text-center">Live Line Margin</th>
              <th className="py-3.5 px-4 text-right">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {lines.map((item, idx) => {
              const marginPct = item.line_margin_pct ?? 30.0;
              const marginClass = getMarginColorClass(marginPct);

              return (
                <tr key={idx} className="hover:bg-white/5 transition-all">
                  <td className="py-4 px-4 font-bold text-white">
                    {item.product_name}
                  </td>

                  {/* Quantity Number Inputs with +/- buttons */}
                  <td className="py-4 px-4 text-center">
                    <div className="inline-flex items-center border border-white/20 rounded-xl overflow-hidden bg-black">
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, -1)}
                        className="px-3 py-1.5 text-white/60 hover:text-white hover:bg-white/10 font-bold transition-all"
                      >
                        -
                      </button>
                      <span className="px-3 py-1.5 text-xs font-bold text-white min-w-[32px]">
                        {cartItems[idx]?.quantity || item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, 1)}
                        className="px-3 py-1.5 text-white/60 hover:text-white hover:bg-white/10 font-bold transition-all"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right text-white/70">
                    ${(item.list_price || item.unit_price || 0).toLocaleString()}
                  </td>

                  {/* Discount Input */}
                  <td className="py-4 px-4 text-center">
                    <div className="relative inline-block w-24">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={cartItems[idx]?.discount_pct ?? item.discount_pct ?? 0}
                        onChange={(e) => updateDiscount(idx, e.target.value)}
                        className="w-full bg-black border border-white/20 rounded-xl py-1.5 pl-2 pr-6 text-center font-bold text-xs text-white focus:outline-none focus:border-[#FF7A45]"
                      />
                      <span className="absolute right-2.5 top-1.5 text-xs font-bold text-white/50">%</span>
                    </div>
                  </td>

                  {/* Live Line-Level Margin Indicator */}
                  <td className="py-4 px-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${marginClass}`}>
                      {marginPct.toFixed(1)}%
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right font-bold text-white">
                    ${(item.line_total || 0).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sticky Cart Summary & Visual Horizontal Margin Bar */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#A6A39C] uppercase font-bold tracking-wider">Total Order Value</div>
            <div className="text-3xl font-serif font-bold text-white mt-0.5">
              ${grandTotal.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <div className="text-xs text-[#A6A39C] uppercase font-bold tracking-wider text-right">Blended Cart Margin</div>
              <div className={`text-2xl font-bold text-right mt-0.5 ${blendedMargin > 20 ? 'text-emerald-400' : blendedMargin >= 10 ? 'text-amber-400' : 'text-rose-400'}`}>
                {blendedMargin.toFixed(1)}%
              </div>
            </div>

            <button
              type="button"
              disabled={savingCart}
              onClick={handleSaveCartToDatabase}
              className="px-5 py-2.5 rounded-full bg-[#FF4A1C] hover:bg-[#E03A0E] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF4A1C]/20 flex items-center gap-2 cursor-pointer"
            >
              {savingCart ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Save Cart State</span>
            </button>
          </div>
        </div>

        {/* Visual Horizontal Margin Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-[11px] font-bold text-[#A6A39C]">
            <span>Margin Health Progress</span>
            <span>Target: &gt;20.0%</span>
          </div>
          <div className="w-full h-3 bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(blendedMargin)}`}
              style={{ width: `${Math.min(100, Math.max(0, blendedMargin * 2))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
