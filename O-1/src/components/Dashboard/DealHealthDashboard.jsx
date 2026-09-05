import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Send,
  CheckCircle2,
  Clock,
  UserCheck,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function DealHealthDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlertId, setExpandedAlertId] = useState(null);
  const [nudgeStates, setNudgeStates] = useState({});

  useEffect(() => {
    fetchHealthAlerts();
  }, []);

  const fetchHealthAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.warn("Health alerts fetch fallback:", err);
      // Fallback demo alerts
      setAlerts([
        {
          id: "alert-1",
          quotation_id: "q-1042",
          quote_number: "QT-2026-1042",
          customer_name: "Acme Corp",
          rep_name: "Alex Morgan",
          alert_type: "STALLED",
          severity: "WARNING",
          days_stalled: 8,
          stage: "UNDER_NEGOTIATION",
          grand_total: 111250.0,
          description: "⚠️ Acme Corp - Stuck in Negotiation for 8 Days without updates.",
          suggested_action: "CUSTOMER_REMINDER"
        },
        {
          id: "alert-2",
          quotation_id: "q-1043",
          quote_number: "QT-2026-1043",
          customer_name: "Beta Industries",
          rep_name: "Sarah Vance",
          alert_type: "OUTLIER",
          severity: "CRITICAL",
          current_discount_pct: 22.0,
          historical_avg_discount_pct: 12.5,
          deviation_pct: 9.5,
          stage: "PENDING_MANAGER_APPROVAL",
          grand_total: 85000.0,
          description: "🚨 Beta Industries - Discount (22%) is 9.5% above Rep's historical average (12.5%).",
          suggested_action: "MANAGER_ESCALATION"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerNudge = async (alert) => {
    const qId = alert.quotation_id;
    const actionType = alert.suggested_action || "CUSTOMER_REMINDER";

    // OPTIMISTIC UPDATE: Change button state immediately to "Sent! ✓"
    setNudgeStates(prev => ({ ...prev, [alert.id]: "SENT" }));

    try {
      await fetch(`/api/health/nudge/${qId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action_type: actionType })
      });
    } catch (err) {
      console.error("Nudge API error:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#A6A39C] flex items-center justify-center gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#FF4A1C]" />
        <span>Monitoring deal health & calculating rep discount anomalies...</span>
      </div>
    );
  }

  return (
    <div className="bg-[#151517] border border-white/10 rounded-[24px] p-6 shadow-2xl space-y-6 text-[#F5F1EA]">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight">Deal Health & Anomaly Detection Dashboard</h2>
          </div>
          <p className="text-xs text-[#A6A39C] mt-1">
            Real-time automated detection of stalled deals and rep discount statistical outliers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{alerts.length} Active Alert(s)</span>
          </span>
        </div>
      </div>

      {/* Grid of Semantic Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alert) => {
          const isStalled = alert.alert_type === "STALLED";
          const isSent = nudgeStates[alert.id] === "SENT";
          const isExpanded = expandedAlertId === alert.id;

          const cardClass = isStalled
            ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
            : "bg-rose-500/10 border-rose-500/30 text-rose-300";

          const buttonClass = isStalled
            ? "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
            : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20";

          const actionLabel = alert.suggested_action === "CUSTOMER_REMINDER"
            ? "Nudge Customer"
            : alert.suggested_action === "MANAGER_ESCALATION"
            ? "Ping Approver"
            : "Flag for Review";

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border ${cardClass} space-y-4 shadow-xl transition-all relative overflow-hidden`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 shrink-0 mt-0.5">
                    {isStalled ? <Clock className="w-5 h-5 text-amber-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">{alert.customer_name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-white/80">
                        {alert.quote_number}
                      </span>
                    </div>
                    <p className="text-xs mt-1 text-white/90 font-medium">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedAlertId(isExpanded ? null : alert.id)}
                  className="p-1 text-white/60 hover:text-white transition-colors"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Expanded Deal Context */}
              {isExpanded && (
                <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-2 text-xs text-white/80 animate-fadeIn">
                  <div className="flex justify-between">
                    <span className="text-[#A6A39C]">Contract Value:</span>
                    <span className="font-bold text-white">${(alert.grand_total || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A6A39C]">Assigned Sales Rep:</span>
                    <span className="font-bold text-white">{alert.rep_name || 'Alex Morgan'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A6A39C]">Current Stage:</span>
                    <span className="font-bold text-white">{alert.stage}</span>
                  </div>
                  {alert.deviation_pct && (
                    <div className="flex justify-between text-rose-300 font-bold border-t border-white/10 pt-1.5">
                      <span>Statistical Discount Outlier:</span>
                      <span>+{alert.deviation_pct}% above Rep Avg</span>
                    </div>
                  )}
                </div>
              )}

              {/* One-Click Action Buttons with Optimistic Feedback */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="text-[11px] font-bold text-white/60">
                  {isStalled ? `${alert.days_stalled || 7} Days Inactive` : "Margin Anomaly"}
                </div>

                <button
                  type="button"
                  disabled={isSent}
                  onClick={() => handleTriggerNudge(alert)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-lg flex items-center gap-1.5 cursor-pointer ${
                    isSent ? 'bg-emerald-500 text-black border border-emerald-400' : buttonClass
                  }`}
                >
                  {isSent ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sent! ✓</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{actionLabel}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
