"use client";

import React, { useState } from "react";
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
  Cpu,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import ChartTooltip from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
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
import { fmtCurrency } from "@/lib/format";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  sqlQuery?: string;
  tableData?: {
    headers: string[];
    rows: (string | number)[][];
  };
  chartData?: any[];
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m-1",
    sender: "ai",
    text: "Hello! I am your Retail Hub AI Assistant & Data Copilot. Ask me any question in plain English about sales speed, customer drop-off risk, product inventory replenishment, or store revenue.",
    timestamp: "12:00 PM",
  },
];

const PROMPT_CHIPS = [
  "Top 5 products by sales speed",
  "Accounts with high drop-off risk (>75%)",
  "Next month demand forecast for this store",
  "Delivery transit delay summary by courier",
];

export default function ChatPage() {
  const { selectedStore } = useStore();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setIsLoading(true);

    setTimeout(() => {
      let aiResponse: ChatMessage;

      if (query.toLowerCase().includes("sku") || query.toLowerCase().includes("speed") || query.toLowerCase().includes("product")) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Here are the top-selling items by growth speed for ${selectedStore.name}. The fastest moving product is Wireless Noise-Canceling Headphones (+34.2% YoY).`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sqlQuery: `SELECT product_code, product_name, category, sales_growth, total_revenue \nFROM retail_catalog \nWHERE store_scope = '${selectedStore.id === "all" ? "ALL" : selectedStore.id}' \nORDER BY sales_growth DESC \nLIMIT 5;`,
          tableData: {
            headers: ["Product Code", "Product Name", "Category", "Sales Growth", "Total Sales"],
            rows: [
              ["SKU-8842", "Wireless Noise-Canceling Headphones", "Electronics", "+34.2%", "₹1.42 Cr"],
              ["SKU-3109", "Organic Espresso Dark Roast (1kg)", "Grocery", "+28.1%", "₹98.4L"],
              ["SKU-9901", "Ergonomic Mesh Executive Chair", "Office", "+22.5%", "₹84.2L"],
              ["SKU-4412", "Smart Fitness Watch Series V", "Electronics", "+19.8%", "₹76.8L"],
              ["SKU-2041", "Stainless Steel Insulated Tumbler", "Home", "+16.4%", "₹54.1L"],
            ],
          },
          chartData: [
            { name: "Headphones", value: 34.2 },
            { name: "Espresso", value: 28.1 },
            { name: "Chair", value: 22.5 },
            { name: "Watch", value: 19.8 },
            { name: "Tumbler", value: 16.4 },
          ],
        };
      } else if (query.toLowerCase().includes("risk") || query.toLowerCase().includes("customer") || query.toLowerCase().includes("account")) {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Identified 5 valuable customer accounts with inactive status and over 75% drop-off risk. Sending a promotional discount voucher or personal follow-up is recommended.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sqlQuery: `SELECT account_id, business_name, lifetime_spend, dropoff_risk_score, days_inactive \nFROM customer_intelligence \nWHERE dropoff_risk_score > 75 \nORDER BY lifetime_spend DESC;`,
          tableData: {
            headers: ["Account ID", "Client Name", "Lifetime Spend", "Inactivity Risk", "Days Inactive"],
            rows: [
              ["CUST-9014", "High-Volume Wholesale LLC", "₹48.5L", "92%", "45 days"],
              ["CUST-3821", "Apex Retail Distribution", "₹32.1L", "88%", "38 days"],
              ["CUST-1049", "TechGear Direct Shopper", "₹18.4L", "84%", "52 days"],
              ["CUST-7729", "OmniCorp Purchasing", "₹15.9L", "79%", "41 days"],
              ["CUST-5510", "Metro Cafe Chain HQ", "₹12.4L", "76%", "60 days"],
            ],
          },
          chartData: [
            { name: "Wholesale LLC", value: 92 },
            { name: "Apex Retail", value: 88 },
            { name: "TechGear", value: 84 },
            { name: "OmniCorp", value: 79 },
            { name: "Metro Cafe", value: 76 },
          ],
        };
      } else {
        aiResponse = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Analyzed recent transactional records for ${selectedStore.name}. Operational performance and sync intervals are within healthy parameters.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sqlQuery: `SELECT DATE_TRUNC('hour', transaction_time) as hour, SUM(order_total) as hourly_sales \nFROM store_transactions \nGROUP BY 1 ORDER BY 1 DESC LIMIT 6;`,
          chartData: [
            { name: "10:00", value: 420000 },
            { name: "11:00", value: 580000 },
            { name: "12:00", value: 740000 },
            { name: "13:00", value: 810000 },
            { name: "14:00", value: 940000 },
            { name: "15:00", value: 890000 },
          ],
        };
      }

      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 700);
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
        subtitle={`Natural language question answering with automated SQL query generation and chart visualizations for ${selectedStore.name}`}
      />

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="AI Assistant Model"
          value="Retail Copilot"
          change="Online"
          trend="up"
          icon={Brain}
          subtitle="Trained for retail store analytics and predictive queries"
        />
        <KpiCard
          title="Average Query Speed"
          value="0.7 sec"
          change="Sub-second response"
          trend="up"
          icon={Zap}
          subtitle="Time required to generate SQL and visual response"
        />
        <KpiCard
          title="Query Modes"
          value="Plain Text & SQL"
          change="Auto-translated"
          trend="neutral"
          icon={Terminal}
          subtitle="Converts plain business questions directly to SQL queries"
        />
        <KpiCard
          title="Active Store Scope"
          value={selectedStore.name}
          change="Scope synced"
          trend="neutral"
          icon={Database}
          subtitle="Queries filter results based on selected store location"
        />
      </div>

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Quick Prompts & Suggestions */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <ChartCard
            title="Suggested Business Prompts"
            subtitle="Click any prompt to instantly query the data warehouse"
          >
            <div className="space-y-2 my-1">
              {PROMPT_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="w-full text-left p-3 bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 rounded-lg text-xs font-medium text-slate-700 hover:text-indigo-900 transition-colors flex items-center justify-between group"
                >
                  <span>{chip}</span>
                  <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" />
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
                <span className="font-semibold text-slate-800">Sales & Revenue:</span> Identify top performers, channel breakdowns, and margin trends.
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-800">Inventory & Stock:</span> Check warehouse storage, low stock alerts, and replenishment times.
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-semibold text-slate-800">Customer Intelligence:</span> Review retention cohorts and accounts needing follow-ups.
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
            <div className="space-y-4 max-h-[500px] overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`p-4 rounded-lg max-w-2xl space-y-3 text-xs ${
                      msg.sender === "user"
                        ? "bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-br-none"
                        : "bg-white border border-slate-200 text-slate-900 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5 font-semibold">
                        {msg.sender === "ai" ? (
                          <>
                            <Brain className="w-3.5 h-3.5 text-indigo-600" /> AI Copilot
                          </>
                        ) : (
                          "Your Question"
                        )}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="leading-relaxed text-sm font-medium text-slate-800">{msg.text}</p>

                    {/* SQL Query Box */}
                    {msg.sqlQuery && (
                      <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg font-mono text-xs space-y-2 text-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-500 pb-1.5 border-b border-slate-200">
                          <span className="flex items-center gap-1 text-indigo-700 font-medium">
                            <Terminal className="w-3.5 h-3.5" /> Auto-Generated SQL
                          </span>
                          <button
                            onClick={() => copySql(msg.sqlQuery!, msg.id)}
                            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors font-sans text-xs"
                          >
                            {copiedId === msg.id ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            {copiedId === msg.id ? "Copied!" : "Copy SQL"}
                          </button>
                        </div>
                        <pre className="text-slate-700 overflow-x-auto leading-relaxed">{msg.sqlQuery}</pre>
                      </div>
                    )}

                    {/* Tabular Data View */}
                    {msg.tableData && (
                      <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                        <div className="text-xs font-semibold uppercase text-indigo-700 flex items-center gap-1">
                          <TableIcon className="w-3.5 h-3.5" /> Data Table
                        </div>
                        <div className="overflow-x-auto border border-slate-200 rounded-lg">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                              <tr>
                                {msg.tableData.headers.map((h, i) => (
                                  <th key={i} className="p-2 font-medium">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-sans">
                              {msg.tableData.rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-slate-50">
                                  {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="p-2 text-slate-800 font-medium">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Recharts Visualizer */}
                    {msg.chartData && msg.chartData.length > 0 && (
                      <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                        <div className="text-xs font-semibold uppercase text-indigo-700 flex items-center gap-1">
                          <BarChart2 className="w-3.5 h-3.5" /> Chart Visualization
                        </div>
                        <div className="h-44 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={msg.chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <CartesianGrid {...CHART_GRID_PROPS} />
                              <XAxis
                                dataKey="name"
                                {...CHART_AXIS_PROPS}
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
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-indigo-600 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Querying database and generating visual answer...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg">
              <input
                type="text"
                placeholder="Ask Retail AI Copilot anything about sales, inventory, or customers..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{isLoading ? "Querying..." : "Send Query"}</span>
              </button>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
