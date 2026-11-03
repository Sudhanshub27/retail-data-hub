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
  Zap,
  Database,
  ChevronDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
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

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    sender: "ai",
    text: "Hello! I am your Retail Data Hub AI Assistant. Ask any question in plain English about revenue, sales trends, store performance, customer drop-off risk, or inventory replenishment.",
    timestamp: "Online",
  },
];

const SUGGESTED_PROMPTS = [
  "Revenue by city across all sales channels",
  "Top 5 best-selling products by revenue",
  "Monthly sales and revenue trajectory over time",
  "Customer distribution across RFM loyalty tiers",
];

export default function ChatPage() {
  const { selectedStore } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
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

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Retail AI Assistant & Data Copilot"
        subtitle={`Natural language question answering with automated DuckDB SQL generation and verified Gold layer data for ${selectedStore.name}`}
      />

      {/* 2. Row of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="AI Assistant Model"
          value="Gemini 2.5 Flash"
          change="Production"
          trend="up"
          icon={Brain}
          subtitle="Google GenAI SDK with multi-turn reasoning"
        />
        <KpiCard
          title="Query Engine"
          value="DuckDB OLAP"
          change="Sub-second"
          trend="up"
          icon={Zap}
          subtitle="Direct read-only execution on Gold Parquet"
        />
        <KpiCard
          title="Query Modes"
          value="Text to SQL"
          change="Read-Only"
          trend="neutral"
          icon={Terminal}
          subtitle="Converts plain questions to verified star-schema SQL"
        />
        <KpiCard
          title="Active Store Scope"
          value={selectedStore.name}
          change="Scope Synced"
          trend="neutral"
          icon={Database}
          subtitle="Direct alignment with current omnichannel selection"
        />
      </div>

      {/* 3. 12-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Quick Prompts & Suggestions */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <ChartCard
            title="Suggested Business Prompts"
            subtitle="Click any prompt to instantly query the data warehouse"
          >
            <div className="space-y-2 my-1">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="w-full text-left p-3 bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg text-xs font-medium text-slate-700 hover:text-indigo-900 transition-colors flex items-center justify-between group disabled:opacity-50"
                >
                  <span className="leading-snug">{prompt}</span>
                  <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title="Copilot Capabilities"
            subtitle="What questions you can ask the assistant"
          >
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-800">Sales & Revenue:</span> Identify top performers, city rankings, channel mixes, and margin trends.
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-800">Inventory & Stock:</span> Check warehouse levels, stockout risks, and replenishment schedules.
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-800">Customer Intelligence:</span> Review retention cohorts, RFM customer segments, and at-risk accounts.
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Right Column: Interactive Chat Canvas */}
        <div className="col-span-12 lg:col-span-8">
          <ChartCard
            title="Conversation & Query Visualizer"
            subtitle="Real-time assistant responses with generated SQL statements, data tables, and charts"
          >
            {/* Chat Messages Log */}
            <div className="space-y-4 max-h-[550px] overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-4 rounded-lg max-w-2xl space-y-3 text-xs ${
                      msg.sender === "user"
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-br-none"
                        : msg.isError
                        ? "bg-rose-50 border border-rose-200 text-rose-950 rounded-bl-none shadow-sm"
                        : "bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {/* Message Header */}
                    <div className="flex items-center justify-between gap-4 text-xs text-slate-400 font-medium">
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
                      <div className="prose prose-sm prose-slate max-w-none text-xs leading-relaxed text-slate-800 font-normal">
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
                <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-indigo-600 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 flex-shrink-0" />
                  <span>Querying DuckDB Gold layer and generating verified response...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="flex items-end gap-2 p-2 bg-white border border-slate-200 rounded-lg">
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
                className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium resize-none disabled:opacity-50"
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
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
