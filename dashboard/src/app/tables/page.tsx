"use client";

import { useState, useEffect, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { useToast } from "@/components/Toast";
import { PageSkeleton } from "@/components/Skeleton";
import {
    Database,
    Table2,
    Star,
    Download,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    Key,
    Link2,
    Search,
    FileJson,
    FileSpreadsheet,
    ArrowRight,
    Eye,
    X,
    Hash,
    Type,
    Calendar,
    ToggleLeft,
    ChevronsLeft,
    ChevronsRight,
    Loader2,
} from "lucide-react";
import { API_BASE } from "@/config";
import PageHeader from "@/components/PageHeader";

const LAYER_META: Record<string, { label: string; color: string; icon: any; description: string }> = {
    gold: {
        label: "Gold",
        color: "#eab308",
        icon: Star,
        description: "Star-schema analytics layer — fact & dimension tables",
    },
    silver: {
        label: "Silver",
        color: "#64748b",
        icon: Link2,
        description: "Cleaned & validated data — deduped, quality-checked",
    },
    bronze: {
        label: "Bronze",
        color: "#cd7f32",
        icon: Download,
        description: "Raw ingested data — untransformed, as received",
    },
};

const DTYPE_ICONS: Record<string, any> = {
    int64: Hash, int32: Hash, float64: Hash,
    object: Type, "datetime64[ns]": Calendar, bool: ToggleLeft,
};

function fmtNum(n: number | undefined | null): string {
    return (n ?? 0).toLocaleString("en-IN");
}

/* ── Paginated Table Viewer ── */
function PaginatedTable({
    layer,
    tableName,
    columns,
    onNavigate,
}: {
    layer: string;
    tableName: string;
    columns: any[];
    onNavigate: (name: string) => void;
}) {
    const [page, setPage] = useState(1);
    const [pageData, setPageData] = useState<any>(null);
    const [loadingRows, setLoadingRows] = useState(false);

    const fetchPage = useCallback(async (p: number) => {
        setLoadingRows(true);
        try {
            const res = await fetch(`${API_BASE}/api/tables/rows/${layer}/${tableName}?page=${p}&page_size=20`);
            const data = await res.json();
            setPageData(data);
            setPage(p);
        } catch {
            setPageData(null);
        }
        setLoadingRows(false);
    }, [layer, tableName]);

    useEffect(() => {
        fetchPage(1);
    }, [fetchPage]);

    if (!pageData) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
            </div>
        );
    }

    const rows = pageData.rows || [];
    const totalPages = pageData.total_pages || 1;
    const totalRows = pageData.total_rows || 0;
    const startRow = (page - 1) * 20 + 1;
    const endRow = Math.min(page * 20, totalRows);

    return (
        <div className="space-y-4">
            {/* Data grid */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-xs bg-white">
                <table className="w-full text-xs min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-center px-3 py-3 text-[11px] font-bold text-slate-700 w-12 border-r border-slate-200/60">#</th>
                            {columns.map((col: any, i: number) => (
                                <th
                                    key={i}
                                    className="text-left px-3.5 py-3 text-[11px] font-bold text-slate-700 uppercase tracking-wider whitespace-nowrap border-r border-slate-200/60 last:border-r-0"
                                >
                                    <div className="flex items-center gap-1.5">
                                        {col.is_pk && <Key className="w-3.5 h-3.5 text-amber-500" />}
                                        {col.fk_to && (
                                            <button onClick={() => onNavigate(col.fk_to)} title={`Jump to ${col.fk_to}`}>
                                                <Link2 className="w-3.5 h-3.5 text-indigo-500 hover:text-indigo-700 transition-colors" />
                                            </button>
                                        )}
                                        <span>{col.name}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className={`divide-y divide-slate-100 ${loadingRows ? "opacity-40 transition-opacity" : "transition-opacity"}`}>
                        {rows.map((row: any, ri: number) => (
                            <tr key={ri} className="hover:bg-slate-50/80 transition-colors">
                                <td className="text-center px-3 py-2.5 text-[11px] text-slate-500 font-mono tabular-nums border-r border-slate-200/60">{startRow + ri}</td>
                                {columns.map((col: any, ci: number) => {
                                    const val = row[col.name];
                                    const display = val === null || val === undefined ? "—" : String(val);
                                    return (
                                        <td
                                            key={ci}
                                            className={`px-3.5 py-2.5 whitespace-nowrap font-mono tabular-nums text-xs border-r border-slate-200/60 last:border-r-0 ${
                                                val === null ? "text-slate-400 italic" : "text-slate-900 font-medium"
                                            }`}
                                            title={display}
                                        >
                                            {display.length > 35 ? display.slice(0, 35) + "…" : display}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Touch-Friendly Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-5 gap-4 px-1">
                <p className="text-xs text-slate-600 font-medium tabular-nums order-2 sm:order-1">
                    Showing <span className="text-slate-900 font-bold">{fmtNum(startRow)}</span> – <span className="text-slate-900 font-bold">{fmtNum(endRow)}</span> of <span className="text-slate-900 font-bold">{fmtNum(totalRows)}</span> rows
                </p>

                <div className="flex items-center gap-1.5 order-1 sm:order-2">
                    <button
                        onClick={() => fetchPage(1)}
                        disabled={page <= 1}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
                        title="First page"
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => fetchPage(page - 1)}
                        disabled={page <= 1}
                        className="h-9 px-3 rounded-lg flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Prev</span>
                    </button>

                    <span className="text-xs font-bold text-slate-800 px-3 tabular-nums">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => fetchPage(page + 1)}
                        disabled={page >= totalPages}
                        className="h-9 px-3 rounded-lg flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                        <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => fetchPage(totalPages)}
                        disabled={page >= totalPages}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
                        title="Last page"
                    >
                        <ChevronsRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ── */
export default function DataTablesPage() {
    const { data, loading } = useApi<any>("/api/tables");
    const { showToast } = useToast();
    const [selectedTable, setSelectedTable] = useState<{ layer: string; name: string } | null>(null);
    const [search, setSearch] = useState("");
    const [dlFormat, setDlFormat] = useState<"csv" | "json">("csv");
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (loading || !data) return <PageSkeleton />;

    const filterTables = (tables: any[]) => {
        if (!search) return tables;
        const q = search.toLowerCase();
        return tables.filter(
            (t: any) =>
                t.name.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q)
        );
    };

    const getSelectedTableMeta = () => {
        if (!selectedTable) return null;
        return (data[selectedTable.layer] || []).find((t: any) => t.name === selectedTable.name);
    };

    const selectedMeta = getSelectedTableMeta();

    const handleSelect = (layer: string, name: string) => {
        if (selectedTable?.layer === layer && selectedTable?.name === name) {
            setSelectedTable(null);
        } else {
            setSelectedTable({ layer, name });
            setTimeout(() => {
                document.getElementById("table-viewer")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    };

    const handleNavigate = (tableName: string) => {
        for (const layer of ["gold", "silver", "bronze"]) {
            const found = (data[layer] || []).find((t: any) => t.name === tableName);
            if (found) {
                handleSelect(layer, tableName);
                return;
            }
        }
    };

    const handleDownload = () => {
        if (!selectedTable) return;
        window.open(`${API_BASE}/api/tables/download/${selectedTable.layer}/${selectedTable.name}?format=${dlFormat}`, "_blank");
        showToast(`Downloading ${selectedTable.name}.${dlFormat}...`, "success");
    };

    const totalTables = Object.values(data).reduce((s: number, l: any) => s + (l as any[]).length, 0);
    const totalRows = Object.values(data).reduce((s: number, l: any) => s + (l as any[]).reduce((ss: number, t: any) => ss + t.rows, 0), 0);

    return (
        <div className="space-y-8">
            <PageHeader
                icon={Database}
                title="Data Tables Explorer"
                subtitle={`${totalTables} tables across Bronze → Silver → Gold · ${fmtNum(totalRows)} total rows`}
            />

            {/* Search bar with clear icon */}
            <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tables by name or description..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Layer Sections */}
            {(["gold", "silver", "bronze"] as const).map((layer) => {
                const meta = LAYER_META[layer];
                const tables = filterTables(data[layer] || []);
                if (tables.length === 0 && search) return null;

                return (
                    <section key={layer} id={layer}>
                        <div className="flex items-center gap-3 mb-4">
                            <meta.icon className="w-5 h-5" style={{ color: meta.color }} />
                            <div>
                                <h2 className="text-base font-bold text-slate-900">{meta.label} Layer</h2>
                                <p className="text-xs text-slate-600 font-medium">{meta.description}</p>
                            </div>
                            <span className="ml-auto text-xs text-slate-700 font-bold font-mono">{tables.length} tables</span>
                        </div>

                        <div className="space-y-2.5">
                            {tables.map((tbl: any) => {
                                const isSelected = selectedTable?.layer === layer && selectedTable?.name === tbl.name;
                                const isFact = tbl.table_type === "fact";
                                const isDim = tbl.table_type === "dimension";

                                return (
                                    <button
                                        key={tbl.name}
                                        onClick={() => handleSelect(layer, tbl.name)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${
                                            isSelected
                                                ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                                                : "bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                                        }`}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ background: `${meta.color}15` }}
                                        >
                                            {isFact ? <Star className="w-5 h-5 text-amber-500" /> :
                                                isDim ? <Link2 className="w-5 h-5 text-indigo-500" /> :
                                                    <Table2 className="w-5 h-5" style={{ color: meta.color }} />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-900">{tbl.name}</span>
                                                {(isFact || isDim) && (
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                                        isFact ? "text-amber-700 bg-amber-100" : "text-indigo-700 bg-indigo-100"
                                                    }`}>
                                                        {tbl.table_type}
                                                    </span>
                                                )}
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold font-mono">{tbl.format}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 font-medium mt-0.5 truncate">{tbl.description}</p>
                                        </div>

                                        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-sm font-bold text-slate-900 tabular-nums">{fmtNum(tbl.rows)}</p>
                                                <p className="text-[10px] text-slate-500 font-semibold uppercase">rows</p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-sm font-bold text-slate-900 tabular-nums">{tbl.columns}</p>
                                                <p className="text-[10px] text-slate-500 font-semibold uppercase">cols</p>
                                            </div>
                                            <Eye className={`w-4 h-4 ${isSelected ? "text-indigo-600" : "text-slate-400"}`} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                );
            })}

            {/* TABLE VIEWER PANEL */}
            {selectedMeta && (
                <div id="table-viewer" className="saas-card p-6 animate-slide-up space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Database className="w-5 h-5 text-indigo-600" />
                                <h3 className="text-base font-bold text-slate-900">{selectedMeta.name}</h3>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold uppercase">
                                    {LAYER_META[selectedTable!.layer].label}
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">{selectedMeta.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex rounded-lg overflow-hidden border border-slate-200 p-0.5 bg-slate-50">
                                <button
                                    onClick={() => setDlFormat("csv")}
                                    className={`px-2.5 py-1 text-xs font-semibold uppercase flex items-center gap-1 rounded transition-all ${
                                        dlFormat === "csv" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    <FileSpreadsheet className="w-3 h-3" /> CSV
                                </button>
                                <button
                                    onClick={() => setDlFormat("json")}
                                    className={`px-2.5 py-1 text-xs font-semibold uppercase flex items-center gap-1 rounded transition-all ${
                                        dlFormat === "json" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    <FileJson className="w-3 h-3" /> JSON
                                </button>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <Download className="w-3.5 h-3.5" /> Download
                            </button>
                            <button
                                onClick={() => setSelectedTable(null)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <PaginatedTable
                        layer={selectedTable!.layer}
                        tableName={selectedTable!.name}
                        columns={selectedMeta.column_info || []}
                        onNavigate={handleNavigate}
                    />
                </div>
            )}

            {/* Scroll to Top */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={`fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transition-all duration-300 hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
                aria-label="Scroll to top"
            >
                <ArrowUp className="w-4 h-4" />
            </button>
        </div>
    );
}
