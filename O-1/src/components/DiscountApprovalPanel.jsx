import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Send,
  AlertTriangle,
  FileText,
  UserCheck,
  Building2,
  Sparkles
} from 'lucide-react';

/**
 * DiscountApprovalPanel Component
 * 
 * Features:
 * - Live Margin & Blended Risk Score Indicator with dynamic Tailwind color coding:
 *     Green (<= 0.0): Auto-approved / FULFILLMENT
 *     Yellow (0.1 - 5.0): Sales Manager Approval
 *     Red (> 5.0): Sales Manager + Finance Escalation
 * - Interactive Approval Chain Visualization: [ Sales Rep ] -> [ Manager ] -> [ Finance ] -> [ Fulfillment ]
 * - Approver Action Form with 10-character minimum Rationale validation before enabling action buttons.
 * - Production API calls to /api/approvals/{id}/action & /api/quotations/{id}/submit
 */
export default function DiscountApprovalPanel({
  quoteId = "q-1042",
  quoteNumber = "QT-2026-1042",
  currentStage = "PENDING_MANAGER_APPROVAL",
  blendedRiskScore = 7.2,
  approvalRequired = "Sales Manager & Finance",
  escalateToFinance = true,
  userRole = "Sales Manager",
  userId = "usr-002",
  userName = "Sarah Vance",
  onStatusChange = null,
  lineBreakdowns = []
}) {
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [localStage, setLocalStage] = useState(currentStage);

  const isRationaleValid = rationale.trim().length >= 10;
  const charsRemaining = Math.max(0, 10 - rationale.trim().length);

  // Score Color Mapping
  let scoreBadgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let scoreTextColor = "text-emerald-500";
  let scoreBgGradient = "from-emerald-500/20 via-emerald-500/5 to-transparent";
  let riskLevelLabel = "Low Risk (Auto-Approval Eligible)";

  if (blendedRiskScore > 5.0) {
    scoreBadgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/30";
    scoreTextColor = "text-rose-500";
    scoreBgGradient = "from-rose-500/20 via-rose-500/5 to-transparent";
    riskLevelLabel = "High Risk (Requires Manager + Finance Review)";
  } else if (blendedRiskScore > 0.0) {
    scoreBadgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    scoreTextColor = "text-amber-500";
    scoreBgGradient = "from-amber-500/20 via-amber-500/5 to-transparent";
    riskLevelLabel = "Medium Risk (Requires Manager Approval)";
  }

  // Determine stage active state for timeline
  const isDraft = localStage === "Draft";
  const isPendingMgr = localStage === "Pending Approval" || localStage === "PENDING_MANAGER_APPROVAL";
  const isPendingFin = localStage === "PENDING_FINANCE_APPROVAL";
  const isFulfilled = localStage === "Approved" || localStage === "FULFILLMENT" || localStage === "Confirmed";
  const isRejected = localStage === "Rejected" || localStage === "REJECTED";

  const handleAction = async (actionType) => {
    if (!isRationaleValid) return;
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`/api/approvals/${quoteId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          rationale: rationale.trim(),
          user_id: userId,
          user_role: userRole,
          approver_name: userName,
          step: isPendingFin ? "Finance" : "Sales Manager"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Action ${actionType} failed`);
      }

      setSuccessMsg(data.message || `Successfully executed ${actionType}`);
      if (data.new_stage) {
        setLocalStage(data.new_stage);
      }
      setRationale('');

      if (onStatusChange) {
        onStatusChange(data);
      }
    } catch (err) {
      console.error("Approval Action Error:", err);
      setErrorMsg(err.message || "Failed to process governance action");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#151517] border border-white/10 rounded-[24px] p-6 shadow-2xl space-y-6 text-[#F5F1EA]">
      {/* Top Header & Blended Risk Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className={`w-6 h-6 ${scoreTextColor}`} />
            <h2 className="text-xl font-bold tracking-tight">Blended Discount Risk Engine</h2>
          </div>
          <p className="text-xs text-[#A6A39C] mt-1">
            Multi-Tier Discount Governance & Automated Approval Routing for Quote <span className="font-semibold text-white">{quoteNumber}</span>
          </p>
        </div>

        {/* Live Score Display */}
        <div className={`px-4 py-2.5 rounded-2xl border ${scoreBadgeColor} flex items-center gap-3 bg-gradient-to-r ${scoreBgGradient}`}>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Blended Risk Score</div>
            <div className="text-2xl font-black tracking-tight flex items-baseline gap-1">
              <span>{blendedRiskScore.toFixed(1)}</span>
              <span className="text-xs font-medium opacity-70">%</span>
            </div>
          </div>
          <div className="text-right border-l border-white/15 pl-3 text-[11px] font-semibold leading-tight max-w-[130px]">
            {riskLevelLabel}
          </div>
        </div>
      </div>

      {/* Approval Chain Timeline */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#A6A39C] mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#FF4A1C]" />
          Governance Approval Routing Chain
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Step 1: Sales Rep Submit */}
          <div className={`p-3.5 rounded-xl border transition-all ${!isDraft ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-white/60'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">Step 1</span>
              {!isDraft ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 opacity-50" />}
            </div>
            <div className="font-bold text-sm mt-1">Sales Rep</div>
            <div className="text-[11px] opacity-80">Submitted & Locked</div>
          </div>

          {/* Step 2: Sales Manager Approval */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isPendingMgr ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-2 ring-amber-500/20' :
            (isPendingFin || isFulfilled) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            isRejected ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
            'bg-white/5 border-white/10 text-white/40'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">Step 2</span>
              {isPendingMgr ? <Clock className="w-4 h-4 text-amber-400 animate-pulse" /> :
               (isPendingFin || isFulfilled) ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
               isRejected ? <XCircle className="w-4 h-4 text-rose-400" /> : <Clock className="w-4 h-4 opacity-40" />}
            </div>
            <div className="font-bold text-sm mt-1">Sales Manager</div>
            <div className="text-[11px] opacity-80">
              {isPendingMgr ? 'Pending Review' : (isPendingFin || isFulfilled) ? 'Approved' : 'Governance Step'}
            </div>
          </div>

          {/* Step 3: Finance Review */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isPendingFin ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 ring-2 ring-amber-500/20' :
            isFulfilled ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
            (escalateToFinance || blendedRiskScore > 5.0) ? 'bg-white/5 border-rose-500/30 text-rose-300/80' :
            'bg-white/5 border-white/10 text-white/30'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">Step 3</span>
              {isPendingFin ? <Clock className="w-4 h-4 text-amber-400 animate-pulse" /> :
               isFulfilled ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
               (escalateToFinance || blendedRiskScore > 5.0) ? <AlertTriangle className="w-4 h-4 text-rose-400" /> :
               <Clock className="w-4 h-4 opacity-40" />}
            </div>
            <div className="font-bold text-sm mt-1">Finance Escalation</div>
            <div className="text-[11px] opacity-80">
              {isPendingFin ? 'Pending Finance' : isFulfilled ? 'Approved' : (blendedRiskScore > 5.0 ? 'Required (>5% Risk)' : 'Not Required')}
            </div>
          </div>

          {/* Step 4: Fulfillment */}
          <div className={`p-3.5 rounded-xl border transition-all ${isFulfilled ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/10 text-white/40'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider">Step 4</span>
              {isFulfilled ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 opacity-40" />}
            </div>
            <div className="font-bold text-sm mt-1">Fulfillment</div>
            <div className="text-[11px] opacity-80">{isFulfilled ? 'Auto-Released' : 'Locked until Approved'}</div>
          </div>
        </div>
      </div>

      {/* Action Form */}
      <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="rationale-note" className="text-xs font-bold uppercase tracking-wider text-[#F5F1EA] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#FF4A1C]" />
            Governance Rationale Note <span className="text-rose-400">*</span>
          </label>
          <span className={`text-[11px] font-semibold ${isRationaleValid ? 'text-emerald-400' : 'text-amber-400'}`}>
            {isRationaleValid ? '✓ Minimum length satisfied' : `Requires ${charsRemaining} more characters`}
          </span>
        </div>

        <textarea
          id="rationale-note"
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder="Provide detailed justification or rationale for this discount approval/rejection (minimum 10 characters required)..."
          rows={3}
          className="w-full bg-[#0A0A0B] border border-white/15 rounded-xl p-3.5 text-sm text-[#F5F1EA] placeholder:text-white/30 focus:outline-none focus:border-[#FF4A1C] transition-all resize-none"
        />

        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-[#A6A39C] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-white/50" />
            <span>Logged in as: <strong className="text-white">{userName}</strong> ({userRole})</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!isRationaleValid || loading}
              onClick={() => handleAction('REJECT')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isRationaleValid && !loading
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20'
                  : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/5'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Quotation</span>
            </button>

            <button
              type="button"
              disabled={!isRationaleValid || loading}
              onClick={() => handleAction('APPROVE')}
              className={`px-6 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isRationaleValid && !loading
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                  : 'bg-white/10 text-white/30 cursor-not-allowed border border-white/5'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>Approve & Route</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
