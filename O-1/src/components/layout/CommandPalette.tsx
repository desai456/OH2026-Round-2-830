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

  const handleSelectCustomer = (customerId: string) => {
    const custQuote = quotes.find(q => q.customerId === customerId);
    if (custQuote) {
      setSelectedQuoteId(custQuote.id);
      navigate(`/quotes/${custQuote.id}`);
    } else {
      const newQ = createQuote(customerId);
      navigate(`/quotes/${newQ.id}`);
    }
    onClose();
  };

  const handleSelectProduct = (productId: string) => {
    navigate(`/products/${productId}`);
    onClose();
  };

  const handleCreateNewQuote = () => {
    const q = createQuote(CUSTOMERS[0].id);
    navigate(`/quotes/${q.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#151517] text-[#F5F1EA] border border-white/10 rounded-[20px] shadow-2xl overflow-hidden flex flex-col">
        {/* Search Bar */}
        <div className="flex items-center px-4 border-b border-white/8 py-3.5">
          <Search className="w-5 h-5 text-[#A6A39C] mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search quotes, products, customers..."
            className="w-full bg-transparent text-[#F5F1EA] placeholder-[#A6A39C] focus:outline-none text-base font-medium"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#A6A39C] hover:text-[#F5F1EA] hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 divide-y divide-white/5 scrollbar-none">
          {/* Quick Actions */}
          <div className="pb-2">
            <span className="text-[11px] font-bold text-[#A6A39C] uppercase tracking-wider px-3 mb-1.5 block">
              Quick Actions
            </span>
            <button
              onClick={handleCreateNewQuote}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-[#F5F1EA] hover:bg-white/5 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#FF4A1C]" />
                <span>Create New Quotation</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#A6A39C] group-hover:text-[#F5F1EA] transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => {
                navigate('/approvals');
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-[#F5F1EA] hover:bg-white/5 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Open Approvals Workspace</span>
              </div>
              <ArrowRight className="w-4 h-4 text-[#A6A39C] group-hover:text-[#F5F1EA] transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Quotations */}
          {filteredQuotes.length > 0 && (
            <div className="py-2">
              <span className="text-[11px] font-bold text-[#A6A39C] uppercase tracking-wider px-3 mb-1.5 block">
                Quotations ({filteredQuotes.length})
              </span>
              {filteredQuotes.map(q => (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuote(q.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-[#F5F1EA] hover:bg-white/5 rounded-xl transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#A6A39C]" />
                    <span className="font-semibold text-[#FF7A45]">{q.quoteNumber}</span>
                    <span className="text-[#A6A39C]">{q.opportunity}</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A6A39C]">
                    {q.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Customers */}
          {filteredCustomers.length > 0 && (
            <div className="py-2">
              <span className="text-[11px] font-bold text-[#A6A39C] uppercase tracking-wider px-3 mb-1.5 block">
                Customers ({filteredCustomers.length})
              </span>
              {filteredCustomers.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCustomer(c.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-[#F5F1EA] hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-[#A6A39C]" />
                    <span>{c.name}</span>
                  </div>
                  <span className="text-xs text-amber-400 font-semibold">{c.tier} Tier</span>
                </button>
              ))}
            </div>
          )}

          {/* Products */}
          {filteredProducts.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#A6A39C] uppercase tracking-wider px-3 mb-1.5 block">
                Products ({filteredProducts.length})
              </span>
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProduct(p.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-[#F5F1EA] hover:bg-white/5 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-4 h-4 text-[#A6A39C]" />
                    <span>{p.name}</span>
                    <span className="text-xs text-[#A6A39C]">({p.sku})</span>
                  </div>
                  <span className="text-xs font-medium text-[#F5F1EA]">${p.basePrice.toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
        </div>


        {/* Footer */}
        <div className="bg-[#121214] px-4 py-2.5 border-t border-white/8 flex items-center justify-between text-xs text-[#A6A39C]">
          <span>Navigate with arrows or click</span>
          <span><kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono text-[#F5F1EA]">Esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
}
