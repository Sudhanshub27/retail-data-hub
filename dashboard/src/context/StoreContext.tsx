"use client";

import React, { createContext, useContext, useState } from "react";

export interface StoreOption {
  id: string;
  name: string;
  type: string;
  location: string;
  multiplier: number; // multiplier to adjust dataset numbers based on scope
}

export const STORE_OPTIONS: StoreOption[] = [
  { id: "all", name: "🏢 All Omnichannel Stores (142 Locations)", type: "Omnichannel", location: "Global Network", multiplier: 1.0 },
  { id: "ecommerce", name: "🛒 E-Commerce Global Store", type: "Digital Channel", location: "Cloud / Web & App", multiplier: 0.58 },
  { id: "nyc_broadway", name: "📍 Flagship Store - NYC Broadway", type: "Physical Retail", location: "New York, NY", multiplier: 0.18 },
  { id: "chicago_downtown", name: "📍 Store #104 - Chicago Michigan Ave", type: "Physical Retail", location: "Chicago, IL", multiplier: 0.14 },
  { id: "la_sunset", name: "📍 Store #208 - Los Angeles Sunset", type: "Physical Retail", location: "Los Angeles, CA", multiplier: 0.10 },
];

interface StoreContextType {
  selectedStore: StoreOption;
  setSelectedStore: (store: StoreOption) => void;
  isCmdKOpen: boolean;
  setIsCmdKOpen: (open: boolean) => void;
  isUploadOpen: boolean;
  setIsUploadOpen: (open: boolean) => void;
  isAlertConfigOpen: boolean;
  setIsAlertConfigOpen: (open: boolean) => void;
  exportPdf: (title?: string) => Promise<void>;
  isExportingPdf: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [selectedStore, setSelectedStore] = useState<StoreOption>(STORE_OPTIONS[0]);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAlertConfigOpen, setIsAlertConfigOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const exportPdf = async (title: string = "Executive-Summary-Report") => {
    setIsExportingPdf(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const element = document.getElementById("dashboard-pdf-area") || document.body;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#090d16",
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${title}-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        selectedStore,
        setSelectedStore,
        isCmdKOpen,
        setIsCmdKOpen,
        isUploadOpen,
        setIsUploadOpen,
        isAlertConfigOpen,
        setIsAlertConfigOpen,
        exportPdf,
        isExportingPdf,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
