"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Brain,
  Send,
  Sparkles,
  Terminal,
  Table as TableIcon,
  BarChart2,
  Copy,
  CheckCircle2,
  Loader2,
  ChevronDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PageHeader from "@/components/PageHeader";
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

const initialMessages: ChatMessage[] = [
  {
    id: "welcome-1",
    sender: "ai",
    text: "Hello! I am your Retail Data Hub AI Assistant. Ask any question in plain English about revenue, sales trends, store performance, customer drop-off risk, or inventory replenishment.",
    timestamp: "Online",
  },
];

const suggestedPrompts = [
  "Revenue by city across all sales channels",
  "Top 5 best-selling products by revenue",
  "Monthly sales and revenue trajectory over time",
  "Customer distribution across RFM loyalty tiers",
];

export default function ChatPage() {
  const { selectedStore } = useStore();
  const { data: health, loading: healthLoading } = useApi<ChatHealthResponse>("/api/chat/health");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message on update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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
        text: data.text || "Here are the query results from the data warehouse.",
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

  const copySql = (sql: string, id: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isReady = Boolean(health?.key_configured && health?.data_loaded);

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] sm:h-[calc(100vh-7.5rem)] lg:h-[calc(100vh-8.5rem)]">
      {/* 1. Header with Status Line */}
      <div className="flex-shrink-0">
        <PageHeader
          title="Retail AI Assistant & Data Copilot"
          subtitle={`Natural language question answering across enterprise sales, inventory, logistics, and customers for ${selectedStore.name}`}
          action={
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium shadow-sm">
              {healthLoading ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
                  <span className="text-slate-500">Checking assistant health...</span>
                </>
              ) : isReady ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-slate-700">{health?.model}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-semibold">Data Ready</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-rose-700 font-medium">
                    {!health?.key_configured
                      ? "No Gemini API Key"
                      : !health?.data_loaded
                      ? "Gold Data Not Loaded"
                      : "Assistant Offline"}
                  </span>
                </>
              )}
            </div>
          }
        />
      </div>

      {/* 2. Chat Canvas filling viewport */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Scrollable Messages Log */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`p-4 rounded-xl max-w-3xl space-y-3 text-xs ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-br-none shadow-sm"
                    : msg.isError
                    ? "bg-rose-50 border border-rose-200 text-rose-950 rounded-bl-none shadow-sm"
                    : "bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm"
                }`}
              >
                {/* Message Header */}
                <div
                  className={`flex items-center justify-between gap-4 text-xs font-medium ${
                    msg.sender === "user" ? "text-indigo-200" : "text-slate-400"
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    {msg.sender === "ai" ? (
                      msg.isError ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Error
                        </>
                      ) : (
                        <>
                          <Brain className="w-3.5 h-3.5 text-indigo-600" /> AI Assistant
                        </>
                      )
                    ) : (
                      "Your Question"
                    )}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Text with Markdown */}
                {msg.isError ? (
                  <div className="space-y-2">
                    <p className="leading-relaxed text-xs font-medium text-rose-800">{msg.text}</p>
                    {msg.failedQuery && (
                      <button
                        onClick={() => handleSend(msg.failedQuery)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-100/60 border border-rose-300 text-rose-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div
                    className={`prose prose-sm max-w-none text-xs leading-relaxed font-normal ${
                      msg.sender === "user"
                        ? "text-white prose-invert"
                        : "text-slate-800 prose-slate"
                    }`}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Collapsible SQL Query Box */}
                {msg.sqlQuery && (
                  <details open className="group/sql bg-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                    <summary className="flex items-center justify-between p-2.5 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 transition-colors">
                      <span className="flex items-center gap-1.5 text-indigo-700 font-medium font-mono text-xs">
                        <Terminal className="w-3.5 h-3.5 text-indigo-600" /> Auto-Generated DuckDB SQL
                      </span>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => copySql(msg.sqlQuery!, msg.id)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                          title="Copy SQL"
                        >
                          {copiedId === msg.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                        </button>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open/sql:rotate-180 transition-transform" />
                      </div>
                    </summary>
                    <div className="p-3 border-t border-slate-200 bg-slate-900 text-slate-100 overflow-x-auto font-mono text-xs">
                      <pre className="leading-relaxed whitespace-pre-wrap">{msg.sqlQuery}</pre>
                    </div>
                  </details>
                )}

                {/* Tabular Data View (only rendered when data exists) */}
                {msg.tableData &&
                  msg.tableData.headers &&
                  msg.tableData.headers.length > 0 &&
                  msg.tableData.rows &&
                  msg.tableData.rows.length > 0 && (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                        <TableIcon className="w-3.5 h-3.5" /> Result Table ({msg.tableData.rows.length} rows)
                      </div>
                      <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-56 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium sticky top-0">
                            <tr>
                              {msg.tableData.headers.map((h, i) => (
                                <th key={i} className="p-2.5 font-medium whitespace-nowrap bg-slate-50">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-sans">
                            {msg.tableData.rows.map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                                {row.map((cell, cellIndex) => (
                                  <td
                                    key={cellIndex}
                                    className="p-2.5 text-slate-800 font-medium whitespace-nowrap"
                                  >
                                    {cell !== null && cell !== undefined ? String(cell) : "-"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Recharts Visualizer (only rendered when chartData exists) */}
                {msg.chartData && msg.chartData.length > 0 && (() => {
                  const chartItems: ChartItem[] = msg.chartData.map((d: any) => ({
                    name: String(d.name ?? "Item"),
                    value:
                      typeof d.value === "number"
                        ? d.value
                        : parseFloat(String(d.value).replace(/[^0-9.-]/g, "")) || 0,
                  }));

                  return (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                        <BarChart2 className="w-3.5 h-3.5" /> Chart Visualization
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
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-indigo-600 animate-pulse w-fit">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600 flex-shrink-0" />
              <span>Querying DuckDB Gold layer and generating verified response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Fixed Input at Bottom with Prompt Chips */}
        <div className="flex-shrink-0 p-3 sm:p-4 bg-white border-t border-slate-200 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Prompts:
            </span>
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs font-medium text-slate-700 hover:text-indigo-900 whitespace-nowrap transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <span>{prompt}</span>
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <textarea
              value={inputPrompt}
              disabled={isLoading}
              rows={2}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask Retail Data Hub AI anything about sales, revenue, inventory, or customers (Enter to send, Shift+Enter for newline)..."
              className="flex-1 bg-transparent px-2 py-1 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium resize-none disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputPrompt.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors flex-shrink-0 mb-0.5"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
