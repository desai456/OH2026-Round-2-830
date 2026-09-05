import React, { useState, useEffect } from 'react';
import FilterBar from './FilterBar';
import {
  FileText,
  Clock,
  DollarSign,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  GripVertical
} from 'lucide-react';

const STAGES = [
  { id: "DRAFT", name: "Draft", color: "border-slate-500/40 text-slate-300" },
  { id: "PENDING_APPROVAL", name: "Pending Approval", color: "border-amber-500/40 text-amber-300" },
  { id: "UNDER_NEGOTIATION", name: "Under Negotiation", color: "border-purple-500/40 text-purple-300" },
  { id: "CONFIRMED", name: "Confirmed", color: "border-emerald-500/40 text-emerald-300" },
  { id: "FULFILLED", name: "Fulfilled", color: "border-blue-500/40 text-blue-300" }
];

export default function DealPipeline() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("this_month");
  const [salesRep, setSalesRep] = useState("All");

  // Drag State for Optimistic UI
  const [draggedQuoteId, setDraggedQuoteId] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchPipelineData();
  }, [period, salesRep]);

  const fetchPipelineData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quotations?status=All`);
      if (res.ok) {
        const data = await res.json();
        setQuotes(data);
      }
    } catch (err) {
      console.warn("Pipeline fetch fallback:", err);
      // Fallback demo items
      setQuotes([
        {
          id: "q-1042",
          quote_number: "QT-2026-1042",
          customer_name: "Acme Corp",
          rep_name: "Alex Morgan",
          status: "PENDING_APPROVAL",
          stage: "PENDING_APPROVAL",
          grand_total: 111250.0,
          created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 8 * 86400000).toISOString()
        },
        {
          id: "q-1043",
          quote_number: "QT-2026-1043",
          customer_name: "Beta Industries",
          rep_name: "Sarah Vance",
          status: "UNDER_NEGOTIATION",
          stage: "UNDER_NEGOTIATION",
          grand_total: 85000.0,
          created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
        },
        {
          id: "q-1044",
          quote_number: "QT-2026-1044",
          customer_name: "Gamma Logistics",
          rep_name: "Alex Morgan",
          status: "DRAFT",
          stage: "DRAFT",
          grand_total: 45000.0,
          created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
          updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysInStage = (updatedAt) => {
    if (!updatedAt) return 1;
    const diff = Date.now() - new Date(updatedAt).getTime();
    return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
  };

  const normalizeStage = (stg) => {
    if (!stg) return "DRAFT";
    const upper = stg.toUpperCase();
    if (upper.includes("DRAFT")) return "DRAFT";
    if (upper.includes("PENDING")) return "PENDING_APPROVAL";
    if (upper.includes("NEGOTIATION")) return "UNDER_NEGOTIATION";
    if (upper.includes("CONFIRMED")) return "CONFIRMED";
    if (upper.includes("FULFILLED") || upper.includes("FULFILLMENT")) return "FULFILLED";
    return "DRAFT";
  };

  // Optimistic Drag & Drop Handler
  const handleDragStart = (e, quoteId) => {
    setDraggedQuoteId(quoteId);
    e.dataTransfer.setData("text/plain", quoteId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    const qId = draggedQuoteId || e.dataTransfer.getData("text/plain");
    if (!qId) return;

    // Save previous state for rollback
    const previousQuotes = [...quotes];
    const targetQuote = quotes.find(q => q.id === qId);

    if (!targetQuote || normalizeStage(targetQuote.status) === targetStageId) {
      setDraggedQuoteId(null);
      return;
    }

    // OPTIMISTIC UPDATE: Instantly update React state
    setQuotes(prev => prev.map(q => {
      if (q.id === qId) {
        return { ...q, status: targetStageId, stage: targetStageId, updated_at: new Date().toISOString() };
      }
      return q;
    }));
    setDraggedQuoteId(null);

    // Background API call
    try {
      const res = await fetch(`/api/quotations/${qId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_stage: targetStageId })
      });

      if (!res.ok) {
        throw new Error("Failed to persist stage transition");
      }

      setStatusMsg(`Moved deal ${targetQuote.quote_number} to ${targetStageId}`);
    } catch (err) {
      console.error("Optimistic drag update failed, rolling back:", err);
      setErrorMsg("Failed to update deal stage. Reverting transition.");
      // Rollback Optimistic State
      setQuotes(previousQuotes);
    }
  };

  // Group quotes by normalized stage
  const groupedQuotes = {};
  STAGES.forEach(s => { groupedQuotes[s.id] = []; });

  quotes.forEach(q => {
    if (salesRep !== "All" && q.rep_name !== salesRep) return;
    const stg = normalizeStage(q.status);
    if (groupedQuotes[stg]) {
      groupedQuotes[stg].push(q);
    } else {
      groupedQuotes["DRAFT"].push(q);
    }
  });

  if (loading) {
    return (
      <div className="p-12 text-center text-[#A6A39C] flex items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#FF4A1C]" />
        <span>Loading Kanban deal pipeline board...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#F5F1EA]">
      <FilterBar
        period={period}
        onPeriodChange={setPeriod}
        salesRep={salesRep}
        onSalesRepChange={setSalesRep}
      />

      {statusMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 5 Distinct Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {STAGES.map(stage => {
          const stageQuotes = groupedQuotes[stage.id] || [];
          const stageTotalVal = stageQuotes.reduce((acc, q) => acc + (q.grand_total || 0), 0);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="bg-[#151517] border border-white/10 rounded-[24px] p-4 flex flex-col min-h-[500px] shadow-xl transition-all"
            >
              {/* Column Header with Count & Monetary Sum */}
              <div className="pb-3 mb-3 border-b border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${stage.color}`}>
                    {stage.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white font-bold text-[10px]">
                    {stageQuotes.length}
                  </span>
                </div>
                <div className="text-xs font-bold text-white">
                  ${stageTotalVal.toLocaleString()}
                </div>
              </div>

              {/* Deal Cards Container */}
              <div className="flex-1 space-y-3">
                {stageQuotes.map(q => {
                  const daysInStage = calculateDaysInStage(q.updated_at || q.created_at);
                  const isStalled = daysInStage > 7;

                  return (
                    <div
                      key={q.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, q.id)}
                      className="bg-black/40 hover:bg-black/70 border border-white/10 hover:border-[#FF7A45]/40 rounded-2xl p-4 space-y-3 cursor-grab active:cursor-grabbing transition-all shadow-md group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-sm text-white group-hover:text-[#FF7A45] transition-colors">
                            {q.customer_name}
                          </div>
                          <div className="text-[11px] text-[#A6A39C] mt-0.5">
                            {q.quote_number} • {q.rep_name || 'Sales Rep'}
                          </div>
                        </div>

                        <GripVertical className="w-4 h-4 text-white/30 group-hover:text-white/70" />
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="font-bold text-white text-sm">
                          ${(q.grand_total || 0).toLocaleString()}
                        </div>

                        {/* Age Badge (Turn Red if Stalled > 7 Days) */}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                          isStalled
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-white/10 text-white/70 border-white/10'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{daysInStage}d in stage</span>
                        </span>
                      </div>
                    </div>
                  );
                })}

                {stageQuotes.length === 0 && (
                  <div className="h-32 border border-dashed border-white/10 rounded-2xl flex items-center justify-center text-xs text-[#A6A39C]">
                    Drop deals here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
