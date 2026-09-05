import React, { useState, useEffect } from 'react';
import FilterGrid from './FilterGrid';
import {
  BarChart3,
  Download,
  Filter,
  Calendar,
  UserCheck,
  RefreshCw,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

export default function ReportingDashboard() {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingCsv, setExportingCsv] = useState(false);

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salesRep, setSalesRep] = useState("All");
  const [status, setStatus] = useState("All");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchFilteredData();
  }, []);

  const fetchFilteredData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        sales_rep: salesRep,
        status: status,
        category: category
      });
      const res = await fetch(`/api/reports/sales?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSalesData(data);
      }
    } catch (err) {
      console.warn("Reporting fetch fallback:", err);
      // Fallback data
      setSalesData([
        {
          id: "q-1042",
          quote_number: "QT-2026-1042",
          created_at: "2026-09-05",
          rep_name: "Alex Morgan",
          customer_name: "Acme Corp",
          customer_tier: "Gold",
          grand_total: 111250.0,
          margin_percent: 31.8,
          status: "Pending Approval"
        },
        {
          id: "q-1043",
          quote_number: "QT-2026-1043",
          created_at: "2026-09-04",
          rep_name: "Sarah Vance",
          customer_name: "Beta Industries",
          customer_tier: "Silver",
          grand_total: 85000.0,
          margin_percent: 24.5,
          status: "Confirmed"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // NATIVE BLOB HANDLING: CSV Export
  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const queryParams = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
        sales_rep: salesRep,
        status: status,
        category: category
      });

      const res = await fetch(`/api/reports/sales/export?${queryParams.toString()}`);
      if (!res.ok) throw new Error("CSV Export Failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export CSV Error:", err);
    } finally {
      setExportingCsv(false);
    }
  };

  // NATIVE BLOB HANDLING: PDF Export
  const handleDownloadPdf = async (quoteId, quoteNumber) => {
    try {
      const res = await fetch(`/api/quotations/${quoteId}/pdf`);
      if (!res.ok) throw new Error("PDF Export Failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Quotation_${quoteNumber || quoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Download Error:", err);
    }
  };

  return (
    <div className="space-y-6 text-[#F5F1EA]">
      {/* Header & Prominent Export Action */}
      <div className="bg-[#151517] border border-white/10 rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#FF7A45]" />
            <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
              Executive Reporting & Export Engine
            </h1>
          </div>
          <p className="text-xs text-[#A6A39C] mt-1">
            Dynamic multi-dimensional sales filtering, native CSV data exports & PDF generation.
          </p>
        </div>

        <button
          type="button"
          disabled={exportingCsv}
          onClick={handleExportCsv}
          className="px-5 py-2.5 rounded-full bg-[#FF4A1C] hover:bg-[#E03A0E] text-white text-xs font-bold transition-all shadow-lg shadow-[#FF4A1C]/20 flex items-center gap-2 cursor-pointer"
        >
          {exportingCsv ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Dynamic Filter Bar */}
      <div className="bg-[#151517] border border-white/10 rounded-[20px] p-5 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Filter className="w-4 h-4 text-[#FF7A45]" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">Dynamic Query Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <label className="text-[11px] font-bold text-[#A6A39C] block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-xl p-2 text-white focus:outline-none focus:border-[#FF7A45]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#A6A39C] block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-xl p-2 text-white focus:outline-none focus:border-[#FF7A45]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#A6A39C] block mb-1">Sales Rep</label>
            <select
              value={salesRep}
              onChange={(e) => setSalesRep(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-xl p-2 text-white focus:outline-none focus:border-[#FF7A45]"
            >
              {["All", "Alex Morgan", "Sarah Vance", "Michael Sterling", "David Ops"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#A6A39C] block mb-1">Approval Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-black border border-white/20 rounded-xl p-2 text-white focus:outline-none focus:border-[#FF7A45]"
            >
              {["All", "Draft", "Pending Approval", "Approved", "Confirmed", "FULFILLMENT"].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={fetchFilteredData}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-[#FF7A45]" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Grid with Row PDF Action */}
      {loading ? (
        <div className="p-12 text-center text-[#A6A39C] flex items-center justify-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#FF4A1C]" />
          <span>Executing dynamic reporting query...</span>
        </div>
      ) : (
        <FilterGrid data={salesData} onDownloadPdf={handleDownloadPdf} />
      )}
    </div>
  );
}
