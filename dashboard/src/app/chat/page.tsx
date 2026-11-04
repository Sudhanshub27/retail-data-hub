"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Terminal,
  Table as TableIcon,
  BarChart2,
  Copy,
  CheckCircle2,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChartTooltip from "@/components/ChartTooltip";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/context/StoreContext";
import { CHART_COLORS, CHART_AXIS_PROPS, CHART_GRID_PROPS } from "@/lib/theme";
import { API_BASE } from "@/config";
import { useApi } from "@/hooks/useApi";
import { fmtCurrency } from "@/lib/format";

interface TableData {
  headers: string[];
  rows: (string | number | null)[][];
}

interface ChartItem {
  name: string;
  value: number;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  sqlQuery?: string | null;
  tableData?: TableData | null;
  chartData?: any[] | null;
  timestamp: string;
  isError?: boolean;
  errorCode?: string;
  failedQuery?: string;
}

interface ChatHealthResponse {
  key_configured: boolean;
  model: string;
  data_loaded: boolean;
}

const promptCards = [
  {
    title: "Top SKUs by Revenue",
    description: "Rank best-performing products by total sales revenue",
    query: "What are the top 5 best-selling products by revenue?",
  },
  {
    title: "Regional Sales by City",
    description: "Compare total revenue across store cities and online",
    query: "What is the total revenue by city across all channels?",
  },
  {
    title: "Customer RFM Segments",
    description: "Customer count and spend distribution by loyalty tier",
    query: "Show customer distribution and revenue across RFM loyalty tiers",
  },
  {
    title: "Monthly Revenue Trend",
    description: "Analyze monthly gross sales trajectory over time",
    query: "Show monthly sales and revenue trajectory over time",
  },
];

const quickPrompts = [
  "Top 5 products by revenue",
  "Revenue by city across all channels",
  "Monthly sales trajectory",
  "RFM customer tiers",
  "Top stores by sales",
];

export default function ChatPage() {
  const { selectedStore } = useStore();
  const { data: health, loading: healthLoading } = useApi<ChatHealthResponse>("/api/chat/health");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSqlIds, setExpandedSqlIds] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const toggleSql = (id: string) => {
    setExpandedSqlIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputPrompt("");
    setIsLoading(true);

    // Keep the last 6 messages as conversation context
    const historyPayload = updatedMessages.slice(-6).map((m) => ({
      role: m.sender === "user" ? "user" : "model",
      text: m.text,
    }));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, history: historyPayload }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let errData: any = {};
        try {
          errData = await res.json();
        } catch {
          // Response body was not JSON
        }

        const code = errData.code;
        let displayMessage = "An unexpected error occurred. Please try again.";

        if (code === "NO_API_KEY") {
          displayMessage = "Gemini API key is not configured. Please set GEMINI_API_KEY in your server environment.";
        } else if (code === "RATE_LIMIT") {
          displayMessage = "Gemini API rate limit reached. Please wait a moment before trying again.";
        } else if (code === "NO_DATA") {
          displayMessage = errData.error || "Analytics Gold data is not loaded on the server. Please run the data pipeline scripts.";
        } else if (res.status === 504 || res.status === 502 || res.status === 503) {
          displayMessage = errData.error || "The server may be waking up, try again in 30 seconds.";
        } else if (errData.error) {
          displayMessage = errData.error;
        }

        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: displayMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
          errorCode: code || "SERVER_ERROR",
          failedQuery: query,
        };
        setMessages((prev) => [...prev, errorMsg]);
        return;
      }

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.text || "Query completed successfully.",
        sqlQuery: data.sqlQuery || null,
        tableData: data.tableData || null,
        chartData: Array.isArray(data.chartData) ? data.chartData : null,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      clearTimeout(timeoutId);
      let displayMessage = "The server may be waking up, try again in 30 seconds.";
      if (err.name === "AbortError") {
        displayMessage = "The request timed out after 45 seconds. The server may be waking up, try again in 30 seconds.";
      }

      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: displayMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isError: true,
        errorCode: "NETWORK_ERROR",
        failedQuery: query,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isReady = Boolean(health?.key_configured && health?.data_loaded);

  const formatTableCell = (header: string, val: any) => {
    if (val === null || val === undefined) return "-";
    if (typeof val === "number") {
      const lowerHeader = header.toLowerCase();
      if (
        lowerHeader.includes("revenue") ||
        lowerHeader.includes("amount") ||
        lowerHeader.includes("sales") ||
        lowerHeader.includes("price") ||
        lowerHeader.includes("cost") ||
        lowerHeader.includes("margin")
      ) {
        return fmtCurrency(val);
      }
      return val.toLocaleString("en-IN");
    }
    return String(val);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] sm:h-[calc(100vh-8rem)] lg:h-[calc(100vh-9rem)] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* 1. Minimal Top Header */}
      <div className="flex-shrink-0 border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-900 text-sm">Retail AI Copilot</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 font-medium">{selectedStore.name}</span>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            {healthLoading ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse" />
                <span className="text-slate-400">Connecting...</span>
              </>
            ) : isReady ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-500 font-mono text-[11px]">{health?.model}</span>
                <span className="text-emerald-700 font-medium text-[11px]">Ready</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-rose-600 font-medium text-[11px]">
                  {!health?.key_configured
                    ? "API Key Missing"
                    : !health?.data_loaded
                    ? "Data Offline"
                    : "Offline"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* New Chat Reset Button */}
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
            title="Start a new chat session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        )}
      </div>

      {/* 2. Chat Conversation Canvas */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 scrollbar-thin">
        {messages.length === 0 ? (
          /* Empty State Hero */
          <div className="h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto py-6">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mb-2">
              What would you like to analyze?
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">
              Ask direct business questions. Retail Copilot executes read-only SQL queries on verified Star-Schema tables.
            </p>

            {/* Prompt Suggestion Cards without icons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {promptCards.map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(card.query)}
                  disabled={isLoading}
                  className="p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50 transition-all text-xs flex flex-col justify-between space-y-1 disabled:opacity-50"
                >
                  <span className="font-medium text-slate-900">{card.title}</span>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {card.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Rendered Conversation Messages */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                {msg.sender === "user" ? (
                  /* User Message Bubble */
                  <div className="flex justify-end">
                    <div className="bg-slate-100 text-slate-900 px-4 py-2.5 rounded-2xl rounded-br-sm text-xs sm:text-sm leading-relaxed max-w-[85%] sm:max-w-xl font-normal">
                      {msg.text}
                    </div>
                  </div>
                ) : (
                  /* Assistant Message Canvas */
                  <div className="space-y-3">
                    {msg.isError ? (
                      /* Error Notification */
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 text-xs space-y-2.5 shadow-sm">
                        <div className="flex items-center gap-2 font-semibold text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <span>Query Execution Failed</span>
                        </div>
                        <p className="leading-relaxed text-rose-900">{msg.text}</p>
                        {msg.failedQuery && (
                          <button
                            onClick={() => handleSend(msg.failedQuery)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-100 border border-rose-300 text-rose-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Retry Question</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Markdown Content */
                      <div className="prose prose-sm prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-800">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}

                    {/* Tabular Data View */}
                    {msg.tableData && msg.tableData.rows && msg.tableData.rows.length > 0 && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <TableIcon className="w-3.5 h-3.5 text-indigo-600" />
                            Data Results ({msg.tableData.rows.length} rows)
                          </span>
                        </div>
                        <div className="overflow-x-auto max-h-60 overflow-y-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold sticky top-0">
                              <tr>
                                {msg.tableData.headers.map((h, i) => (
                                  <th key={i} className="p-2.5 whitespace-nowrap bg-slate-50">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-sans">
                              {msg.tableData.rows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                                  {row.map((cell, cIdx) => (
                                    <td
                                      key={cIdx}
                                      className="p-2.5 text-slate-800 whitespace-nowrap font-medium font-mono text-[11px]"
                                    >
                                      {formatTableCell(msg.tableData!.headers[cIdx], cell)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Recharts Bar Visualization */}
                    {msg.chartData && msg.chartData.length > 0 && (() => {
                      const chartItems: ChartItem[] = msg.chartData.map((d: any) => ({
                        name: String(d.name ?? "Item"),
                        value:
                          typeof d.value === "number"
                            ? d.value
                            : parseFloat(String(d.value).replace(/[^0-9.-]/g, "")) || 0,
                      }));

                      return (
                        <div className="border border-slate-200 rounded-xl p-3.5 bg-white shadow-sm space-y-2">
                          <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                            Chart View
                          </div>
                          <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chartItems} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                                <CartesianGrid {...CHART_GRID_PROPS} />
                                <XAxis
                                  dataKey="name"
                                  {...CHART_AXIS_PROPS}
                                  interval={0}
                                  angle={-20}
                                  textAnchor="end"
                                  height={35}
                                />
                                <YAxis {...CHART_AXIS_PROPS} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar
                                  dataKey="value"
                                  name="Value"
                                  fill={CHART_COLORS[0]}
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Collapsible DuckDB SQL Drawer */}
                    {msg.sqlQuery && (
                      <div className="space-y-1.5">
                        <button
                          onClick={() => toggleSql(msg.id)}
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          <Terminal className="w-3 h-3 text-indigo-600" />
                          <span>DuckDB SQL</span>
                          {expandedSqlIds[msg.id] ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>

                        {expandedSqlIds[msg.id] && (
                          <div className="rounded-xl border border-slate-800 bg-slate-900 text-slate-100 overflow-hidden text-xs">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800">
                              <span className="font-mono text-[10px] text-slate-400">DuckDB OLAP Query</span>
                              <button
                                onClick={() => copyToClipboard(msg.sqlQuery!, `sql-${msg.id}`)}
                                className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                              >
                                {copiedId === `sql-${msg.id}` ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-3 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                              {msg.sqlQuery}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Assistant Message Action Bar */}
                    {!msg.isError && (
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <button
                          onClick={() => copyToClipboard(msg.text, `txt-${msg.id}`)}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Copy answer text"
                        >
                          {copiedId === `txt-${msg.id}` ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy answer</span>
                            </>
                          )}
                        </button>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Streaming Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                <span>Thinking and querying Gold layer...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 3. Bottom Centered Input Box */}
      <div className="flex-shrink-0 border-t border-slate-100 bg-white p-3 sm:p-4">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Quick Prompts Chips without icons */}
          {messages.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-[11px] font-medium text-slate-700 whitespace-nowrap transition-colors disabled:opacity-50 flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Clean Input Bar */}
          <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm focus-within:border-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-900/5 transition-all">
            <textarea
              ref={textareaRef}
              value={inputPrompt}
              disabled={isLoading}
              rows={1}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask anything about sales, revenue, products, or customers..."
              className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-normal resize-none disabled:opacity-50 leading-relaxed"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputPrompt.trim()}
              className="p-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-semibold flex items-center justify-center transition-all flex-shrink-0"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="text-[10px] text-center text-slate-400">
            Retail Copilot executes read-only SQL queries on DuckDB Star-Schema Parquet files.
          </p>
        </div>
      </div>
    </div>
  );
}
