import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Calendar,
  Clock,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Sliders,
  DollarSign,
  ArrowRight,
  Receipt,
  FileText,
  Building2,
  Sparkles
} from 'lucide-react';

/**
 * SubscriptionBillingPanel Component
 * 
 * Interactive Billing Workspace Module:
 * - Hybrid View: One-Time Hardware/Services vs. Recurring SaaS Subscriptions.
 * - Upcoming Billing Schedule timeline & invoice history.
 * - Mid-Cycle Modification Modal with live proration preview (Prorated Amount Due / Credit Note Owed).
 * - Cancellation Flow with automated partial refund Credit Note calculation.
 */
export default function SubscriptionBillingPanel({
  orderId = "q-1042",
  quoteNumber = "QT-2026-1042",
  customerName = "Acme Corp"
}) {
  const [loading, setLoading] = useState(true);
  const [billingData, setBillingData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  // Modification Modal State
  const [selectedLine, setSelectedLine] = useState(null);
  const [modQuantity, setModQuantity] = useState(1);
  const [modUnitPrice, setModUnitPrice] = useState(0);
  const [prorationPreview, setProrationPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submittingMod, setSubmittingMod] = useState(false);

  // Cancellation Modal State
  const [cancelLine, setCancelLine] = useState(null);
  const [cancelReason, setCancelReason] = useState("Customer requested tier downgrade");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  useEffect(() => {
    fetchBillingData();
  }, [orderId]);

  const fetchBillingData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/billing/${orderId}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch billing data: ${res.statusText}`);
      }
      const data = await res.json();
      setBillingData(data);
    } catch (err) {
      console.error("Billing Fetch Error:", err);
      // Fallback demonstration data
      setBillingData({
        order_id: orderId,
        customer_name: customerName,
        one_time_charges: [
          {
            id: "ol-hw1",
            product_name: "Enterprise Blade Server X9",
            line_type: "ONE_TIME",
            unit_price: 12500.0,
            quantity: 10,
            applied_discount_pct: 20.0,
            status: "ACTIVE"
          }
        ],
        recurring_subscriptions: [
          {
            id: "ol-sub1",
            product_name: "Enterprise Cloud Suite (Tier 1)",
            line_type: "RECURRING",
            unit_price: 12500.0,
            quantity: 1,
            applied_discount_pct: 10.0,
            billing_cycle: "Annual",
            status: "ACTIVE"
          }
        ],
        invoices: [
          {
            id: "inv-01",
            invoice_number: "INV-2026-1042",
            type: "INITIAL",
            billing_type: "Initial Hybrid Invoice",
            total_amount: 111250.0,
            due_date: "2026-09-19",
            status: "Unpaid"
          }
        ],
        billing_schedules: [
          {
            id: "bs-01",
            order_line_id: "ol-sub1",
            next_billing_date: "2027-09-05",
            amount_due: 11250.0,
            status: "SCHEDULED"
          }
        ],
        credit_notes: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Live Proration Preview Hook on Modal Inputs Change
  useEffect(() => {
    if (!selectedLine) return;

    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch(`/api/subscriptions/${selectedLine.id}/preview-proration`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            new_quantity: modQuantity,
            new_tier_price: modUnitPrice
          })
        });
        const data = await res.json();
        setProrationPreview(data);
      } catch (err) {
        console.error("Preview Proration Error:", err);
      } finally {
        setPreviewLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedLine, modQuantity, modUnitPrice]);

  const openModifyModal = (line) => {
    setSelectedLine(line);
    setModQuantity(line.quantity || 1);
    setModUnitPrice(line.unit_price || 0);
    setProrationPreview(null);
  };

  const handleConfirmModification = async () => {
    if (!selectedLine) return;
    setSubmittingMod(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/subscriptions/${selectedLine.id}/modify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_quantity: modQuantity,
          new_tier_price: modUnitPrice
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Modification failed");
      }

      setStatusMsg(data.description || "Subscription modified successfully with proration!");
      setSelectedLine(null);
      fetchBillingData();
    } catch (err) {
      console.error("Modify Subscription Error:", err);
      setErrorMsg(err.message || "Failed to modify subscription");
    } finally {
      setSubmittingMod(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancelLine) return;
    setSubmittingCancel(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/subscriptions/${cancelLine.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: cancelReason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Cancellation failed");
      }

      setStatusMsg(data.message || "Subscription cancelled and Credit Note generated!");
      setCancelLine(null);
      fetchBillingData();
    } catch (err) {
      console.error("Cancel Subscription Error:", err);
      setErrorMsg(err.message || "Failed to cancel subscription");
    } finally {
      setSubmittingCancel(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[#A6A39C] flex items-center justify-center gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-[#FF4A1C]" />
        <span>Loading hybrid billing schedule & subscription proration engine...</span>
      </div>
    );
  }

  const oneTimeLines = billingData?.one_time_charges || [];
  const recurringLines = billingData?.recurring_subscriptions || [];
  const invoices = billingData?.invoices || [];
  const schedules = billingData?.billing_schedules || [];
  const creditNotes = billingData?.credit_notes || [];

  return (
    <div className="bg-[#151517] border border-white/10 rounded-[24px] p-6 shadow-2xl space-y-6 text-[#F5F1EA]">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#FF4A1C]" />
            <h2 className="text-xl font-bold tracking-tight">Hybrid Billing & Proration Engine</h2>
          </div>
          <p className="text-xs text-[#A6A39C] mt-1">
            Dual-nature invoicing for Order <span className="font-semibold text-white">{quoteNumber}</span> ({customerName})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Daily Pro-Rata Active
          </span>
        </div>
      </div>

      {/* Feedback Notifications */}
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

      {/* HYBRID VIEW: One-Time Charges vs. Recurring Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: One-Time Charges */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F1EA] flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#FF4A1C]" />
              One-Time Charges (Hardware & Services)
            </h3>
            <span className="text-xs text-white/50">{oneTimeLines.length} Item(s)</span>
          </div>

          <div className="space-y-3">
            {oneTimeLines.map((line, idx) => {
              const lineTotal = (line.unit_price * line.quantity * (1 - (line.applied_discount_pct || 0) / 100)).toFixed(2);
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-white">{line.product_name}</div>
                    <div className="text-xs text-[#A6A39C] mt-0.5">
                      ${(line.unit_price || 0).toLocaleString()} × {line.quantity} units {line.applied_discount_pct > 0 && `(${line.applied_discount_pct}% disc)`}
                    </div>
                  </div>
                  <div className="text-right font-bold text-white text-sm">
                    ${parseFloat(lineTotal).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Recurring Subscriptions */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#F5F1EA] flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              Recurring Subscriptions (SaaS Lines)
            </h3>
            <span className="text-xs text-emerald-400 font-semibold">{recurringLines.length} Active Plan(s)</span>
          </div>

          <div className="space-y-3">
            {recurringLines.map((line, idx) => {
              const cycleTotal = (line.unit_price * line.quantity * (1 - (line.applied_discount_pct || 0) / 100)).toFixed(2);
              const isCancelled = line.status === "CANCELLED";

              return (
                <div key={idx} className={`p-4 rounded-xl border transition-all ${isCancelled ? 'bg-rose-500/5 border-rose-500/20 opacity-60' : 'bg-black/40 border-white/10'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{line.product_name}</span>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {line.billing_cycle || 'Monthly'}
                        </span>
                        {isCancelled && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Cancelled
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#A6A39C] mt-1">
                        ${(line.unit_price || 0).toLocaleString()} / cycle × {line.quantity} license(s)
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-emerald-400 text-sm">
                        ${parseFloat(cycleTotal).toLocaleString()} / {line.billing_cycle === 'Annual' ? 'yr' : 'mo'}
                      </div>
                    </div>
                  </div>

                  {!isCancelled && (
                    <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => openModifyModal(line)}
                        className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-400" />
                        <span>Modify Subscription</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setCancelLine(line)}
                        className="px-3 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Billing Schedule Timeline & Invoice History */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A6A39C] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#FF4A1C]" />
          Upcoming Billing Schedule & Invoicing Ledger
        </h3>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-[#A6A39C] font-semibold border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Invoice / Schedule Ref</th>
                <th className="py-3 px-4">Billing Event Type</th>
                <th className="py-3 px-4">Next Billing Date</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Amount Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv, idx) => (
                <tr key={`inv-${idx}`} className="hover:bg-white/5 transition-all">
                  <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#FF4A1C]" />
                    <span>{inv.invoice_number}</span>
                  </td>
                  <td className="py-3 px-4 text-white/80">{inv.billing_type || inv.type}</td>
                  <td className="py-3 px-4 text-[#A6A39C]">{inv.due_date || 'Immediate'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-white">
                    ${(inv.total_amount || 0).toLocaleString()}
                  </td>
                </tr>
              ))}

              {schedules.map((s, idx) => (
                <tr key={`sch-${idx}`} className="hover:bg-white/5 transition-all">
                  <td className="py-3 px-4 font-bold text-white/70 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SCHED-{s.id}</span>
                  </td>
                  <td className="py-3 px-4 text-white/60">Recurring Cycle Automated Billing</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">{s.next_billing_date}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">
                    ${(s.amount_due || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MID-CYCLE MODIFICATION MODAL WITH LIVE PRORATION PREVIEW */}
      {selectedLine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#151517] border border-amber-500/40 rounded-[24px] max-w-md w-full p-6 shadow-2xl space-y-5 text-[#F5F1EA] relative">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Mid-Cycle Adjustment</div>
                <h3 className="text-lg font-bold">Modify Subscription</h3>
              </div>
            </div>

            <div className="text-xs text-[#A6A39C]">
              Adjusting licenses for <strong className="text-white">{selectedLine.product_name}</strong>. Proration math runs automatically in real time.
            </div>

            <div className="space-y-4 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">New Quantity (Licenses)</label>
                <input
                  type="number"
                  min="1"
                  value={modQuantity}
                  onChange={(e) => setModQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-black border border-white/20 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">Unit Tier Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={modUnitPrice}
                  onChange={(e) => setModUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-black border border-white/20 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* LIVE PRORATION PREVIEW DISPLAY */}
              <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60 font-semibold">Proration Calculation:</span>
                  {previewLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                </div>

                <div className="flex items-center justify-between font-bold">
                  <span className="text-xs text-white">Delta Adjustment Owed:</span>
                  <span className={`text-sm ${prorationPreview?.financial_delta >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    ${Math.abs(prorationPreview?.financial_delta || 0).toFixed(2)}
                    <span className="text-[10px] font-normal text-white/60 ml-1">
                      ({prorationPreview?.credit_or_debit || 'Calculated'})
                    </span>
                  </span>
                </div>

                <div className="text-[11px] text-white/50 leading-tight">
                  {prorationPreview?.description || 'Calculated based on daily rate & remaining cycle days.'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLine(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-white/60 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submittingMod}
                onClick={handleConfirmModification}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {submittingMod ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Confirm & Apply Proration</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL WITH CREDIT NOTE PREVIEW */}
      {cancelLine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#151517] border border-rose-500/40 rounded-[24px] max-w-md w-full p-6 shadow-2xl space-y-5 text-[#F5F1EA] relative">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Subscription Termination</div>
                <h3 className="text-lg font-bold">Cancel Subscription Plan</h3>
              </div>
            </div>

            <div className="text-xs text-[#A6A39C]">
              Cancelling plan <strong className="text-white">{cancelLine.product_name}</strong> will stop all future billing schedules and generate a refund Credit Note for the remaining daily balance.
            </div>

            <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">Cancellation Reason</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-black border border-white/20 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Automated Credit Note Refund</span>
                </div>
                <p className="text-[11px] opacity-80">
                  Calculates exact daily refund for unused cycle days and terminates future billing schedules immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelLine(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-white/60 hover:bg-white/5 transition-all"
              >
                Keep Active
              </button>

              <button
                type="button"
                disabled={submittingCancel}
                onClick={handleConfirmCancellation}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                {submittingCancel ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                <span>Confirm Cancellation & Credit Note</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
