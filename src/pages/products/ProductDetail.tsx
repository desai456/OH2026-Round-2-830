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
          className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Product Catalog
        </button>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" /> SKU Configuration Saved!
            </span>
          )}
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1.5" />
            Save Product Rules
          </Button>
        </div>
      </div>

      {/* Main Title Card */}
      <Card padding="lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                {productName}
              </h1>
              <Badge variant="primary" size="sm">Screen 17</Badge>
              <Badge variant="success">Catalog Active</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              SKU: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{sku}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 uppercase font-semibold">Standard Base Price</span>
            <div className="text-3xl font-black text-slate-900 dark:text-slate-100 font-mono mt-0.5">
              ${basePrice.toLocaleString()}
            </div>
          </div>
        </div>

        {/* System Banner */}
        <div className="mt-6">
          <DetailBanner
            title="Product Pricing & Catalog Rule Configuration"
            type="info"
          >
            Configure variant price add-ons, regional multi-currency price lists, and strict discount ceiling limits for sales representatives.
          </DetailBanner>
        </div>

        {/* Core Product Form */}
        <form onSubmit={handleSave} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                SKU Identifier
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Product Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Service">Service</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Base List Price ($)
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Conditional Subscription Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Recurring Subscription Product
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
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
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {isSubscription && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    <option value="Monthly">Monthly Recurring Revenue (MRR)</option>
                    <option value="Annual">Annual Recurring Revenue (ARR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Allowed Discount Ceiling (%)
                  </label>
                  <input
                    type="number"
                    value={discountCeiling}
                    onChange={(e) => setDiscountCeiling(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Repeatable Variants Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Configurable Product Add-Ons & Variants
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Define optional hardware/software add-ons available in the Quote Builder.
                </p>
              </div>
              <Button variant="secondary" size="sm" type="button" onClick={handleAddVariant}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Variant Option
              </Button>
            </div>

            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
                  <span className="text-xs font-mono font-bold text-slate-400">#{idx + 1}</span>
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => {
                      const copy = [...variants];
                      copy[idx].name = e.target.value;
                      setVariants(copy);
                    }}
                    placeholder="Variant Name"
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
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
                    className="w-32 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono text-slate-900 dark:text-slate-100"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-400">+$</span>
                    <input
                      type="number"
                      value={v.priceDelta}
                      onChange={(e) => {
                        const copy = [...variants];
                        copy[idx].priceDelta = Number(e.target.value);
                        setVariants(copy);
                      }}
                      className="w-28 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 font-mono font-bold text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(v.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Price Book Matrix */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" /> Regional Price Book Matrix
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <span className="text-[10px] uppercase font-bold text-slate-500">North America (USD)</span>
                <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 mt-1">
                  ${basePrice.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <span className="text-[10px] uppercase font-bold text-slate-500">EMEA (EUR List)</span>
                <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 mt-1">
                  €{Math.round(basePrice * 0.92).toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <span className="text-[10px] uppercase font-bold text-slate-500">Partner Tier Discount Price</span>
                <div className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${Math.round(basePrice * 0.85).toLocaleString()} (-15%)
                </div>
              </div>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
