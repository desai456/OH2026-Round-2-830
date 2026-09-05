import React, { useState } from 'react';
import { Sliders, Check, Cpu, HardDrive, Shield } from 'lucide-react';
import { Product, QuoteLine } from '../../types';
import { Modal, Button, Badge } from '../ui';

interface ProductConfiguratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  line: QuoteLine;
  onApplyConfig: (updates: Partial<QuoteLine>) => void;
}

export function ProductConfiguratorModal({
  isOpen,
  onClose,
  product,
  line,
  onApplyConfig,
}: ProductConfiguratorModalProps) {
  const [ram, setRam] = useState(line.selectedRam || product.options?.ram?.[0] || '16 GB');
  const [storage, setStorage] = useState(line.selectedStorage || product.options?.storage?.[0] || '512 GB SSD');
  const [warranty, setWarranty] = useState(line.selectedWarranty || product.options?.warranty?.[0] || '1 Year Included');

  const getPriceAdjustment = () => {
    let adj = 0;
    if (ram.includes('+ $400')) adj += 400;
    if (ram.includes('+ $900')) adj += 900;
    if (storage.includes('+ $300')) adj += 300;
    if (storage.includes('+ $700')) adj += 700;
    if (warranty.includes('+ $600')) adj += 600;
    return adj;
  };

  const adj = getPriceAdjustment();
  const finalUnitPrice = product.basePrice + adj;

  const handleSave = () => {
    onApplyConfig({
      selectedRam: ram,
      selectedStorage: storage,
      selectedWarranty: warranty,
      configAdjustment: adj,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Configure ${product.name}`} maxWidth="lg">
      <div className="space-y-5">
        {/* RAM Option */}
        {product.options?.ram && (
          <div>
            <label className="text-xs font-bold text-[#A6A39C] dark:text-[#F5F1EA] uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              Memory (RAM)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {product.options.ram.map(opt => (
                <button
                  key={opt}
                  onClick={() => setRam(opt)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    ram === opt
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-[#1C1C1E] border-white/8 dark:border-white/10 text-[#A6A39C] dark:text-[#F5F1EA]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Storage Option */}
        {product.options?.storage && (
          <div>
            <label className="text-xs font-bold text-[#A6A39C] dark:text-[#F5F1EA] uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <HardDrive className="w-4 h-4 text-blue-600" />
              Solid State Storage
            </label>
            <div className="grid grid-cols-3 gap-2">
              {product.options.storage.map(opt => (
                <button
                  key={opt}
                  onClick={() => setStorage(opt)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    storage === opt
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-[#1C1C1E] border-white/8 dark:border-white/10 text-[#A6A39C] dark:text-[#F5F1EA]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Warranty Option */}
        {product.options?.warranty && (
          <div>
            <label className="text-xs font-bold text-[#A6A39C] dark:text-[#F5F1EA] uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              Enterprise Hardware Coverage
            </label>
            <div className="grid grid-cols-2 gap-2">
              {product.options.warranty.map(opt => (
                <button
                  key={opt}
                  onClick={() => setWarranty(opt)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    warranty === opt
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-[#1C1C1E] border-white/8 dark:border-white/10 text-[#A6A39C] dark:text-[#F5F1EA]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Impact Calculation Summary */}
        <div className="p-4 rounded-xl bg-[#1C1C1E] dark:bg-[#1C1C1E] border border-white/8 dark:border-white/10 flex items-center justify-between text-xs">
          <div>
            <span className="text-[#A6A39C] block">Base Price: ${product.basePrice.toLocaleString()}</span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold block mt-0.5">
              Config Adjustment: +${adj.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-[#6E6C68] uppercase tracking-wider block">Calculated Unit Price</span>
            <span className="text-lg font-black text-[#F5F1EA] dark:text-[#F5F1EA]">${finalUnitPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-white/8 dark:border-white/8">
          <Button onClick={onClose} variant="secondary">Cancel</Button>
          <Button onClick={handleSave} variant="primary">
            <Check className="w-4 h-4" />
            <span>Apply Configuration</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
