import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Building2,
  FileText,
  Clock,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function CustomerPortal({
  quoteId = "q-1042",
  token = "tok_portal_demo_1042"
}) {
  const [loading, setLoading] = useState(true);
  const [quoteData, setQuoteData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  // Line negotiation state: expanded line ID
  const [expandedLineId, setExpandedLineId] = useState(null);
  const [lineComments, setLineComments] = useState({});
  const [newCommentInput, setNewCommentInput] = useState("");

  // Counter offer payload state
  const [lineCounterDiscounts, setLineCounterDiscounts] = useState({});
  const [lineCounterQtys, setLineCounterQtys] = useState({});
  const [globalComment, setGlobalComment] = useState("Proposing volume adjustment for enterprise expansion.");
  const [submittingCounter, setSubmittingCounter] = useState(false);
  const [submittingAccept, setSubmittingAccept] = useState(false);

  useEffect(() => {
    fetchPortalQuote();
  }, [quoteId, token]);

  const fetchPortalQuote = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/portal/quote/${token}`);
      if (!res.ok) {
        throw new Error(`Portal fetch error: ${res.statusText}`);
      }
      const data = await res.json();
      setQuoteData(data);

      // Initialize counter inputs
      const initDiscounts = {};
      const initQtys = {};
      data.items?.forEach(item => {
        initDiscounts[item.id] = item.customer_requested_discount_pct || item.discount_percent || 0;
        initQtys[item.id] = item.customer_requested_qty || item.quantity || 1;
      });
      setLineCounterDiscounts(initDiscounts);
      setLineCounterQtys(initQtys);

    } catch (err) {
      console.warn("Portal fetch fallback:", err);
      // Fallback demonstration data
      setQuoteData({
        quote_number: "QT-2026-1042",
        customer_name: "Acme Corp",
        customer_tier: "Gold",
        status: "Awaiting Your Approval",
        subtotal: 137500.0,
        total_discount: 26250.0,
        grand_total: 111250.0,
        items: [
          {
            id: "qi-hw1",
            product_name: "Enterprise Blade Server X9",
            category: "Hardware",
            quantity: 10,
            unit_price: 12500.0,
            discount_percent: 20.0,
            line_total: 100000.0
          },
          {
            id: "qi-sub1",
            product_name: "Enterprise Cloud Suite (Tier 1)",
            category: "Subscriptions",
            quantity: 1,
            unit_price: 12500.0,
            discount_percent: 10.0,
            line_total: 11250.0
          }
        ],
        comments: [
          {
            id: "lc-1",
            author_type: "INTERNAL",
            author_name: "Alex Morgan (Sales Rep)",
            comment_text: "Applied 20% hardware volume discount for Gold customer tier.",
            timestamp: new Date().toISOString()
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLineCommentSubmit = async (lineId) => {
    if (!newCommentInput.trim()) return;
    try {
      const res = await fetch(`/api/portal/quote/${token}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_id: lineId,
          author_name: quoteData?.customer_name || "Customer Representative",
          comment: newCommentInput
        })
      });
      if (res.ok) {
        setStatusMsg("Line comment added!");
        setNewCommentInput("");
        fetchPortalQuote();
      }
    } catch (err) {
      console.error("Comment submit error:", err);
    }
  };

  const handleSubmitCounterOffer = async () => {
    setSubmittingCounter(true);
    setStatusMsg(null);
    setErrorMsg(null);

    const lineUpdatesPayload = quoteData.items.map(item => ({
      line_id: item.id,
      requested_discount_pct: lineCounterDiscounts[item.id] ?? item.discount_percent,
      requested_qty: lineCounterQtys[item.id] ?? item.quantity
    }));

    try {
      const res = await fetch(`/api/portal/quote/${token}/counter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: quoteData?.customer_name || "Customer Representative",
          comment: globalComment,
          line_updates: lineUpdatesPayload
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.detail || "Counter offer submission failed");
      }

      setStatusMsg(resData.message || "Counter offer submitted! Re-approval governance triggered.");
      fetchPortalQuote();
    } catch (err) {
      console.error("Counter offer error:", err);
      setErrorMsg(err.message || "Failed to submit counter offer");
    } finally {
      setSubmittingCounter(false);
    }
  };

  const handleAcceptProposal = async () => {
    setSubmittingAccept(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/portal/quote/${token}/accept`, {
        method: 'POST'
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.detail || "Acceptance failed");
      }

      setStatusMsg("Proposal accepted! Quotation status updated to CONFIRMED.");
      fetchPortalQuote();
    } catch (err) {
      console.error("Acceptance error:", err);
      setErrorMsg(err.message || "Failed to confirm proposal");
    } finally {
      setSubmittingAccept(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#A6A39C] flex items-center justify-center gap-3 bg-[#0A0A0B] min-h-screen">
        <RefreshCw className="w-6 h-6 animate-spin text-[#FF4A1C]" />
        <span>Loading secure client portal negotiation workspace...</span>
      </div>
    );
  }

  const items = quoteData?.items || [];
  const comments = quoteData?.comments || [];
  const isConfirmed = quoteData?.status === "CONFIRMED" || quoteData?.status === "Confirmed";
  const isUnderReview = quoteData?.status === "PENDING_MANAGER_APPROVAL" || quoteData?.status === "Pending Approval";

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F5F1EA] flex flex-col font-sans pb-28">
      {/* Top Header */}
      <header className="h-16 px-6 lg:px-12 bg-[#151517] border-b border-white/10 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF4A1C] to-[#FF7A45] text-white font-black text-sm flex items-center justify-center shadow-lg border border-white/10">
            DF
          </div>
          <div>
            <h1 className="font-serif font-bold text-sm text-[#F5F1EA] tracking-tight flex items-center gap-2">
              DEALFLOW360
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#1C1C1E] text-[#FF7A45] font-bold border border-white/10 uppercase tracking-widest">
                CUSTOMER PORTAL
              </span>
            </h1>
            <p className="text-[10px] text-[#A6A39C]">Live Commercial Negotiation & Agreement Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Encrypted Session</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        {/* Status Banner */}
        <div className={`p-6 rounded-[24px] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
          isConfirmed
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : isUnderReview
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-[#151517] border-white/10'
        }`}>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF7A45] mb-1">
              Official Proposal • {quoteData?.customer_name} ({quoteData?.customer_tier} Tier)
            </div>
            <h2 className="text-2xl font-serif font-bold text-white">Quotation {quoteData?.quote_number}</h2>
            <p className="text-xs text-[#A6A39C] mt-1">
              {isConfirmed
                ? "This proposal has been officially accepted and confirmed."
                : isUnderReview
                ? "Your counter-offer has been received and is under internal governance review."
                : "Review lines below, negotiate counter terms, or accept to confirm."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${
              isConfirmed
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : isUnderReview
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-[#FF4A1C]/20 text-[#FF7A45] border-[#FF4A1C]/40'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{quoteData?.status || "Awaiting Your Approval"}</span>
            </span>
          </div>
        </div>

        {/* Notifications */}
        {statusMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Read-Only Core Details & Line Item Negotiation UI */}
        <div className="bg-[#151517] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl space-y-0">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF7A45]" />
              Commercial Line Items & Negotiation Controls
            </h3>
            <span className="text-xs text-[#A6A39C]">Prices in USD</span>
          </div>

          <div className="divide-y divide-white/5">
            {items.map((item) => {
              const isExpanded = expandedLineId === item.id;
              const lineDisc = lineCounterDiscounts[item.id] ?? item.discount_percent;
              const lineQty = lineCounterQtys[item.id] ?? item.quantity;
              const lineNet = (item.unit_price * lineQty * (1 - lineDisc / 100)).toFixed(2);

              return (
                <div key={item.id} className="p-5 transition-all hover:bg-white/[0.01]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{item.product_name}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/70">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-xs text-[#A6A39C]">
                        ${(item.unit_price || 0).toLocaleString()} list × {item.quantity} units ({item.discount_percent}% applied discount)
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-[#A6A39C]">Net Subtotal</div>
                        <div className="font-bold text-white text-base">
                          ${parseFloat(lineNet).toLocaleString()}
                        </div>
                      </div>

                      {!isConfirmed && (
                        <button
                          type="button"
                          onClick={() => setExpandedLineId(isExpanded ? null : item.id)}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                            isExpanded
                              ? 'bg-[#FF4A1C] text-white border-[#FF4A1C]'
                              : 'bg-white/5 hover:bg-white/10 text-[#F5F1EA] border-white/10'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#FF7A45]" />
                          <span>Negotiate</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Line Negotiation Panel */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/10 bg-black/40 p-4 rounded-2xl space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-white/80 block mb-1">
                            Counter Discount Requested (%)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            step="0.5"
                            value={lineDisc}
                            onChange={(e) => setLineCounterDiscounts(prev => ({ ...prev, [item.id]: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-black border border-white/20 rounded-xl p-2 text-sm text-white focus:outline-none focus:border-[#FF7A45]"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-white/80 block mb-1">
                            Requested Volume Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={lineQty}
                            onChange={(e) => setLineCounterQtys(prev => ({ ...prev, [item.id]: parseInt(e.target.value) || 1 }))}
                            className="w-full bg-black border border-white/20 rounded-xl p-2 text-sm text-white focus:outline-none focus:border-[#FF7A45]"
                          />
                        </div>
                      </div>

                      {/* Chat Thread */}
                      <div className="space-y-2 pt-2">
                        <div className="text-[11px] font-bold text-[#A6A39C] uppercase tracking-wider">
                          Line Negotiation Thread
                        </div>

                        <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                          {comments.map((c, idx) => (
                            <div key={idx} className={`p-2.5 rounded-xl text-xs ${
                              c.author_type === 'CUSTOMER'
                                ? 'bg-[#FF4A1C]/10 border border-[#FF4A1C]/20 text-[#F5F1EA] ml-6'
                                : 'bg-white/5 border border-white/10 text-white/80 mr-6'
                            }`}>
                              <div className="flex items-center justify-between text-[10px] text-[#A6A39C] mb-1 font-semibold">
                                <span>{c.author_name}</span>
                                <span>{c.timestamp ? new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                              </div>
                              <p>{c.comment_text || c.comment}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            placeholder="Add line message..."
                            value={newCommentInput}
                            onChange={(e) => setNewCommentInput(e.target.value)}
                            className="flex-1 bg-black border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF7A45]"
                          />
                          <button
                            type="button"
                            onClick={() => handleLineCommentSubmit(item.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#FF4A1C] hover:bg-[#E03A0E] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Subtotal Summary */}
          <div className="p-6 bg-black/60 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-[#A6A39C] font-semibold uppercase tracking-wider">Total Contract Value</div>
              <div className="text-3xl font-serif font-bold text-white">
                ${(quoteData?.grand_total || 0).toLocaleString()}
              </div>
            </div>

            <div className="text-xs text-[#A6A39C] text-right">
              <div>Subtotal: ${(quoteData?.subtotal || 0).toLocaleString()}</div>
              <div>Discount: -${(quoteData?.total_discount || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Action Bar */}
      {!isConfirmed && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-[#151517]/95 backdrop-blur-md border-t border-white/10 shadow-2xl">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:block text-xs text-[#A6A39C]">
              <span>Ready to proceed? Confirm current terms or submit counter-offer.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                disabled={submittingCounter}
                onClick={handleSubmitCounterOffer}
                className="px-5 py-2.5 rounded-full border border-white/20 text-xs font-bold text-white hover:bg-white/10 transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                {submittingCounter ? <RefreshCw className="w-4 h-4 animate-spin text-[#FF7A45]" /> : <MessageSquare className="w-4 h-4 text-[#FF7A45]" />}
                <span>Submit Counter Offer</span>
              </button>

              <button
                type="button"
                disabled={submittingAccept}
                onClick={handleAcceptProposal}
                className="px-6 py-2.5 rounded-full bg-[#F5F1EA] hover:bg-white text-black text-xs font-bold transition-all flex items-center gap-2 shadow-lg cursor-pointer"
              >
                {submittingAccept ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                <span>Accept & Confirm Quotation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
