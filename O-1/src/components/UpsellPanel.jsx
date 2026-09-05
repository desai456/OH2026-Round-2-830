import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, TrendingUp, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

/**
 * UpsellPanel Component (Live Recommendation & Margin Delta Panel)
 * - Displays ranked product suggestions based on cart items.
 * - Displays Active Promotion badges and Live Margin Delta Badges (+2.4% / -0.5%).
 * - "Add to Quote" action appends recommendation directly to cart.
 */
export default function UpsellPanel({
  cartItems = [],
  onAddToCart
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [cartItems]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quotations/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems })
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.warn("Recommendations fetch fallback:", err);
      // Fallback demo recommendations
      setRecommendations([
        {
          product_id: "prod-103",
          product_name: "On-Site Deployment & Setup Service",
          category: "Services",
          unit_price: 4500.0,
          cost_price: 3100.0,
          is_promoted: true,
          margin_delta: 2.4,
          promotion_tag: "High Margin Bundle",
          description: "Recommended implementation service for enterprise server deployments."
        },
        {
          product_id: "prod-105",
          product_name: "Platinum Security & Analytics Add-on",
          category: "Subscriptions",
          unit_price: 4800.0,
          cost_price: 800.0,
          is_promoted: false,
          margin_delta: 1.8,
          promotion_tag: "High Margin Cross-Sell",
          description: "Security and compliance add-on with 83% gross margin."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (item) => {
    if (onAddToCart) {
      onAddToCart(item);
    }
  };

  return (
    <div className="bg-[#151517] border border-white/10 rounded-[24px] p-6 shadow-2xl space-y-4 text-[#F5F1EA]">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#FF7A45]" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Live Upsell & Cross-Sell Recommendations
          </h3>
        </div>

        {loading && <RefreshCw className="w-4 h-4 animate-spin text-[#FF7A45]" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          const isPositiveDelta = (rec.margin_delta || 0) >= 0;

          return (
            <div
              key={rec.product_id}
              className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-[#FF7A45]/40 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-sm text-white group-hover:text-[#FF7A45] transition-colors">
                    {rec.product_name}
                  </span>

                  {/* Live Margin Delta Badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 shrink-0 ${
                    isPositiveDelta
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    <TrendingUp className="w-3 h-3" />
                    <span>{isPositiveDelta ? `+${rec.margin_delta}%` : `${rec.margin_delta}%`} Blended Margin</span>
                  </span>
                </div>

                <p className="text-xs text-[#A6A39C] line-clamp-2">
                  {rec.description}
                </p>

                {rec.is_promoted && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF4A1C]/20 text-[#FF7A45] border border-[#FF4A1C]/30">
                    ★ Active Promotion ({rec.promotion_tag || 'Special Bundle'})
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="font-bold text-white text-base">
                  ${(rec.unit_price || 0).toLocaleString()}
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(rec)}
                  className="px-4 py-1.5 rounded-full bg-[#FF4A1C] hover:bg-[#E03A0E] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Quote</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
