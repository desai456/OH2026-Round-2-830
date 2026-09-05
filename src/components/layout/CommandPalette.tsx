import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Users, Package, CreditCard, ArrowRight, X, Sparkles } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { PRODUCTS, CUSTOMERS } from '../../data/mockData';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { quotes, invoices, setSelectedQuoteId, createQuote } = useAppContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredQuotes = quotes.filter(
    q => q.quoteNumber.toLowerCase().includes(query.toLowerCase()) || q.owner.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCustomers = CUSTOMERS.filter(
    c => c.name.toLowerCase().includes(query.toLowerCase()) || c.opportunity.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProducts = PRODUCTS.filter(
    p => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectQuote = (id: string) => {
    setSelectedQuoteId(id);
    navigate(`/quotes/${id}`);
    onClose();
  };

  const handleCreateNewQuote = () => {
    const q = createQuote(CUSTOMERS[0].id);
    navigate(`/quotes/${q.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800 py-3">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search quotes, products, customers..."
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-base font-medium"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 divide-y divide-slate-100 dark:divide-slate-800/60">
          {/* Quick Actions */}
          <div className="pb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5 block">
              Quick Actions
            </span>
            <button
              onClick={handleCreateNewQuote}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Create New Quotation</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => {
                navigate('/approvals');
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Open Approvals Workspace</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Quotations */}
          {filteredQuotes.length > 0 && (
            <div className="py-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5 block">
                Quotations ({filteredQuotes.length})
              </span>
              {filteredQuotes.map(q => (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuote(q.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{q.quoteNumber}</span>
                    <span className="text-slate-500 dark:text-slate-400">{q.opportunity}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {q.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div className="py-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5 block">
                Customers ({filteredCustomers.length})
              </span>
              {filteredCustomers.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{c.name}</span>
                  </div>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{c.tier} Tier</span>
                </div>
              ))}
            </div>
          )}

          {/* Products */}
          {filteredProducts.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5 block">
                Products ({filteredProducts.length})
              </span>
              {filteredProducts.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>{p.name}</span>
                    <span className="text-xs text-slate-400">({p.sku})</span>
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">${p.basePrice.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Navigate with arrows or click</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[10px] font-mono">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
