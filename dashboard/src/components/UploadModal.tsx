"use client";

import React, { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, X, Check, Database } from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface ColumnMapping {
  fileColumn: string;
  mappedField: string;
  status: "mapped" | "warning" | "error";
  sampleValue: string;
}

export default function UploadModal() {
  const { isUploadOpen, setIsUploadOpen } = useStore();
  const [step, setStep] = useState<"upload" | "mapping" | "preview" | "complete">("upload");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("q3_sales_ingest_omnichannel.csv");
  const [rowCount] = useState(4820);

  const [mappings, setMappings] = useState<ColumnMapping[]>([
    { fileColumn: "transaction_id", mappedField: "order_id", status: "mapped", sampleValue: "TXN-902418" },
    { fileColumn: "sku_code", mappedField: "sku", status: "mapped", sampleValue: "SKU-8842" },
    { fileColumn: "unit_price_usd", mappedField: "price", status: "mapped", sampleValue: "$249.99" },
    { fileColumn: "sale_timestamp", mappedField: "timestamp", status: "mapped", sampleValue: "2026-07-30T22:15:00Z" },
    { fileColumn: "store_location_id", mappedField: "store_id", status: "mapped", sampleValue: "STORE-104" },
    { fileColumn: "promo_code_applied", mappedField: "discount_code", status: "warning", sampleValue: "SUMMER20 (3.2% nulls)" },
  ]);

  if (!isUploadOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
      setStep("mapping");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setIsUploadOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Data Ingestion & File Upload
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingest CSV, Parquet, or Excel files into retail data pipeline
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper */}
        <div className="flex items-center justify-around px-8 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold">
          <div className={`flex items-center gap-2 ${step === "upload" ? "text-indigo-600 font-bold" : "text-slate-500"}`}>
            <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] shadow-xs">1</span>
            Select File
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-2 ${step === "mapping" ? "text-indigo-600 font-bold" : "text-slate-500"}`}>
            <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] shadow-xs">2</span>
            Column Mapping
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          <div className={`flex items-center gap-2 ${step === "preview" ? "text-indigo-600 font-bold" : "text-slate-500"}`}>
            <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] shadow-xs">3</span>
            Validation & Preview
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          {step === "upload" && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50"
              }`}
              onClick={() => setStep("mapping")}
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Drop CSV, Parquet or XLSX dataset here
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Supports files up to 250MB. Automatic schema inference will map retail fields like SKU, Price, Timestamp, and Store ID.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors">
                <FileText className="w-4 h-4" /> Browse Local File...
              </div>
            </div>
          )}

          {step === "mapping" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{fileName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{rowCount.toLocaleString()} rows • 6 columns detected</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono rounded-full font-bold">
                  Schema Mapped (98.4% Match)
                </span>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mt-4">
                Column Mapping Visualizer
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px] uppercase">
                    <tr>
                      <th className="p-3">Uploaded Header</th>
                      <th className="p-3">Mapped Field</th>
                      <th className="p-3">Sample Value</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {mappings.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{m.fileColumn}</td>
                        <td className="p-3">
                          <select
                            value={m.mappedField}
                            onChange={(e) => {
                              const updated = [...mappings];
                              updated[idx].mappedField = e.target.value;
                              setMappings(updated);
                            }}
                            className="bg-white border border-slate-300 text-slate-900 rounded-lg px-2 py-1 text-xs font-mono focus:border-indigo-600 font-semibold"
                          >
                            <option value="order_id">order_id</option>
                            <option value="sku">sku</option>
                            <option value="price">price</option>
                            <option value="timestamp">timestamp</option>
                            <option value="store_id">store_id</option>
                            <option value="discount_code">discount_code</option>
                            <option value="customer_id">customer_id</option>
                          </select>
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{m.sampleValue}</td>
                        <td className="p-3">
                          {m.status === "mapped" ? (
                            <span className="flex items-center gap-1 text-emerald-700 text-[11px] font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-700 text-[11px] font-bold">
                              <AlertCircle className="w-3.5 h-3.5" /> Optional Nulls
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">
                      Validation Passed: Ready to Ingest
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      4,820 rows validated • 0 type mismatches • Primary keys unique
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                <div className="text-xs font-bold text-slate-800">Data Dry-Run Summary:</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-xs">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Revenue Impact</div>
                    <div className="text-base font-extrabold text-emerald-700 font-mono mt-0.5">$342,890.00</div>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-xs">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Unique SKUs</div>
                    <div className="text-base font-extrabold text-indigo-700 font-mono mt-0.5">148 SKUs</div>
                  </div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-xs">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Stores Impacted</div>
                    <div className="text-base font-extrabold text-cyan-700 font-mono mt-0.5">142 Locations</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center text-emerald-600 shadow-sm animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Data Ingestion Successfully Committed!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                4,820 records have been committed to the pipeline. Dashboard metrics and forecasts have been automatically recalculated.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Buttons */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {step !== "complete" ? (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                {step === "mapping" && (
                  <button
                    onClick={() => setStep("upload")}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-xs"
                  >
                    Back
                  </button>
                )}
                {step === "mapping" ? (
                  <button
                    onClick={() => setStep("preview")}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
                  >
                    Run Validation <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : step === "preview" ? (
                  <button
                    onClick={() => setStep("complete")}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <Database className="w-3.5 h-3.5" /> Commit Ingestion Pipeline
                  </button>
                ) : null}
              </div>
            </>
          ) : (
            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              Done & Return to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
