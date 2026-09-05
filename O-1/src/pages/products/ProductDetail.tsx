import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle2, ShieldCheck, DollarSign, Layers, Globe } from 'lucide-react';
import { Badge, Button, Card, DetailBanner } from '../../components/ui';

interface VariantRow {
  id: string;
  name: string;
  skuSuffix: string;
  priceDelta: number;
}

export default function ProductDetail() {
  const { id = 'PROD-101' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [productName, setProductName] = useState('Enterprise Cloud Server X900');
  const [sku, setSku] = useState('SKU-EX900-SRV');
  const [category, setCategory] = useState<'Hardware' | 'Software' | 'Service'>('Hardware');
  const [basePrice, setBasePrice] = useState(45000);
  const [isSubscription, setIsSubscription] = useState(false);
  const [billingCycle, setBillingCycle] = useState('Monthly');
  const [discountCeiling, setDiscountCeiling] = useState(15);

  const [variants, setVariants] = useState<VariantRow[]>([
    { id: 'v1', name: '64GB DDR5 RAM Upgrade', skuSuffix: '-64RAM', priceDelta: 2500 },
    { id: 'v2', name: 'Dual Redundant Power Supply', skuSuffix: '-RPS', priceDelta: 1200 },
    { id: 'v3', name: '10GbE Fiber Controller', skuSuffix: '-10FIB', priceDelta: 1800 },
  ]);

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { id: `v-${Date.now()}`, name: 'New Variant Spec', skuSuffix: '-VAR', priceDelta: 1000 }
    ]);
  };

  const handleRemoveVariant = (varId: string) => {
    setVariants(variants.filter(v => v.id !== varId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center text-xs font-semibold text-[#A6A39C] hover:text-[#F5F1EA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Product Catalog
        </button>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> SKU Configuration Saved!
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold rounded-full bg-[#F5F1EA] text-[#0A0A0B] hover:bg-white transition-all flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Product Rules</span>
          </button>
        </div>
      </div>

      {/* Main Title Card */}
      <div className="bg-[#151517] border border-white/8 rounded-[20px] p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif text-[#F5F1EA] tracking-tight">
                {productName}
              </h1>
              <Badge variant="primary" size="sm">Screen 17</Badge>
              <Badge variant="success">Catalog Active</Badge>
            </div>
            <p className="text-xs text-[#A6A39C] mt-1">
              SKU: <span className="font-mono font-bold text-[#FF7A45]">{sku}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#A6A39C] uppercase font-semibold">Standard Base Price</span>
            <div className="text-3xl font-serif font-bold text-[#F5F1EA] mt-0.5">
              ${basePrice.toLocaleString()}
            </div>
          </div>
        </div>

        {/* System Banner */}
        <div>
          <DetailBanner
            title="Product Pricing & Catalog Rule Configuration"
            type="info"
          >
            Configure variant price add-ons, regional multi-currency price lists, and strict discount ceiling limits for sales representatives.
          </DetailBanner>
        </div>

        {/* Core Product Form */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-[#F5F1EA] mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-[#1C1C1E] text-[#F5F1EA] focus:outline-none focus:border-[#FF4A1C] font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F1EA] mb-1.5">
                SKU Identifier
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-[#1C1C1E] text-[#F5F1EA] focus:outline-none focus:border-[#FF4A1C] font-mono font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F1EA] mb-1.5">
                Product Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-[#1C1C1E] text-[#F5F1EA] focus:outline-none focus:border-[#FF4A1C]"
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Service">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F1EA] mb-1.5">
                Base List Price ($)
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-white/10 bg-[#1C1C1E] text-[#F5F1EA] focus:outline-none focus:border-[#FF4A1C] font-bold"
              />
            </div>
          </div>

          {/* Conditional Subscription Toggle */}
          <div className="p-4 rounded-xl bg-[#1C1C1E] border border-white/8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#F5F1EA]">
                  Recurring Subscription Product
                </span>
                <p className="text-[11px] text-[#A6A39C] mt-0.5">
                  Enable if this SKU charges on a recurring monthly or annual schedule.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSubscription}
                  onChange={(e) => setIsSubscription(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4A1C]"></div>
              </label>
            </div>

            {isSubscription && (
              <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#A6A39C] mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-[#121214] text-[#F5F1EA]"
                  >
                    <option value="Monthly">Monthly Recurring Revenue (MRR)</option>
                    <option value="Annual">Annual Recurring Revenue (ARR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#A6A39C] mb-1">
                    Max Allowed Discount Ceiling (%)
                  </label>
                  <input
                    type="number"
                    value={discountCeiling}
                    onChange={(e) => setDiscountCeiling(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-[#121214] text-[#F5F1EA] font-bold"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Repeatable Variants Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-semibold text-[#F5F1EA] uppercase tracking-wider">
                  Configurable Product Add-Ons & Variants
                </h3>
                <p className="text-[11px] text-[#A6A39C]">
                  Define optional hardware/software add-ons available in the Quote Builder.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-[#F5F1EA] hover:bg-white/5 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-[#FF4A1C]" /> Add Variant Option
              </button>
            </div>

            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-[#1C1C1E]">
                  <span className="text-xs font-mono font-bold text-[#A6A39C]">#{idx + 1}</span>
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx].name = e.target.value;
                      setVariants(copy);
                    }}
                    placeholder="Variant Name"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-[#121214] text-[#F5F1EA]"
                  />
                  <input
                    type="text"
                    value={v.skuSuffix}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx].skuSuffix = e.target.value;
                      setVariants(copy);
                    }}
                    placeholder="SKU Suffix"
                    className="w-32 px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-[#121214] font-mono text-[#F5F1EA]"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#A6A39C]">+$</span>
                    <input
                      type="number"
                      value={v.priceDelta}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].priceDelta = Number(e.target.value);
                        setVariants(copy);
                      }}
                      className="w-28 px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-[#121214] font-bold text-[#FF7A45]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(v.id)}
                    className="p-1 text-[#A6A39C] hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Price Book Matrix */}
          <div className="pt-4 border-t border-white/8">
            <h3 className="text-xs font-semibold text-[#F5F1EA] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#FF4A1C]" /> Regional Price Book Matrix
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-white/8 bg-[#1C1C1E]">
                <span className="text-[10px] uppercase font-semibold text-[#A6A39C]">North America (USD)</span>
                <div className="text-lg font-serif font-bold text-[#F5F1EA] mt-1">
                  ${basePrice.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-white/8 bg-[#1C1C1E]">
                <span className="text-[10px] uppercase font-semibold text-[#A6A39C]">EMEA (EUR List)</span>
                <div className="text-lg font-serif font-bold text-[#F5F1EA] mt-1">
                  €{Math.round(basePrice * 0.92).toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-white/8 bg-[#1C1C1E]">
                <span className="text-[10px] uppercase font-semibold text-[#A6A39C]">Partner Tier Discount Price</span>
                <div className="text-lg font-serif font-bold text-emerald-400 mt-1">
                  ${Math.round(basePrice * 0.85).toLocaleString()} (-15%)
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
