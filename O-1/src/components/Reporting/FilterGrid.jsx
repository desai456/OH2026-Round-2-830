import React from 'react';
import { FileText, Download, ShieldCheck, UserCheck } from 'lucide-react';

export default function FilterGrid({
  data = [],
  onDownloadPdf
}) {
  return (
    <div className="bg-[#151517] border border-white/10 rounded-[24px] overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-black/60 border-b border-white/10 text-[11px] font-bold text-[#A6A39C] uppercase tracking-wider">
              <th className="py-3.5 px-4">Quote Ref</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4">Sales Rep</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4 text-right">Contract Value</th>
              <th className="py-3.5 px-4 text-right">Blended Margin</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-center">Export</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[#F5F1EA]">
            {data.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-white/5 transition-all">
                <td className="py-3.5 px-4 font-bold text-[#FF7A45]">{row.quote_number}</td>
                <td className="py-3.5 px-4 text-[#A6A39C]">{row.created_at}</td>
                <td className="py-3.5 px-4 font-medium text-white/90">{row.rep_name}</td>
                <td className="py-3.5 px-4">
                  <span className="font-bold text-white block">{row.customer_name}</span>
                  <span className="text-[10px] text-[#A6A39C]">{row.customer_tier} Tier</span>
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-white">
                  ${(row.grand_total || 0).toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                  {(row.margin_percent || 0).toFixed(1)}%
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/10">
                    {row.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => onDownloadPdf && onDownloadPdf(row.id, row.quote_number)}
                    className="px-3 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-all flex items-center gap-1 mx-auto cursor-pointer"
                  >
                    <span>📄 PDF</span>
                  </button>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan="8" className="py-12 text-center text-[#A6A39C]">
                  No sales quotations match the selected reporting filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
