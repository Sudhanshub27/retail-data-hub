"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/Toast";
import { API_BASE } from "@/config";

export interface StoreOption {
  id: string;
  name: string;
  city?: string;
  type?: string;
  location?: string;
}

export const DEFAULT_STORE: StoreOption = {
  id: "all",
  name: "All Stores",
  city: "All",
  type: "Omnichannel",
  location: "Pan-India Network",
};

export const STORE_OPTIONS: StoreOption[] = [DEFAULT_STORE];

interface StoreContextType {
  selectedStore: StoreOption;
  setSelectedStore: (store: StoreOption) => void;
  storeOptions: StoreOption[];
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
  const { showToast } = useToast();
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>([DEFAULT_STORE]);
  const [selectedStore, setSelectedStore] = useState<StoreOption>(DEFAULT_STORE);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAlertConfigOpen, setIsAlertConfigOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/stores`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: StoreOption[] = data.map((s) => ({
            id: s.id,
            name: s.id === "all" ? "All Stores" : `${s.city} (${s.id})`,
            city: s.city,
            type: s.id === "all" ? "Omnichannel" : `${s.region || "Retail"} Store`,
            location: s.id === "all" ? "Pan-India Network" : `${s.city}, ${s.state || "India"}`,
          }));
          setStoreOptions(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const exportPdf = async (customTitle?: string) => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    showToast("Preparing PDF report...", "info");

    const scrollX = typeof window !== "undefined" ? window.scrollX : 0;
    const scrollY = typeof window !== "undefined" ? window.scrollY : 0;
    let styleTag: HTMLStyleElement | null = null;

    try {
      // 1. Scroll to top so fixed/sticky elements and captures are aligned
      window.scrollTo(0, 0);

      // 2. Inject print/export temporary style to hide chrome, lock layout at 1280px,
      // and expand all scrollable and capped tables/containers
      styleTag = document.createElement("style");
      styleTag.id = "rdh-pdf-temp-export-style";
      styleTag.innerHTML = `
        /* Hide navigation chrome and transient overlays without hiding html2canvas clone iframe */
        header, aside, [data-html2canvas-ignore="true"]:not(iframe) {
          display: none !important;
        }
        iframe.html2canvas-container {
          display: block !important;
        }
        /* Reset margins and lock fixed width for stable rendering */
        #dashboard-pdf-area {
          margin-left: 0 !important;
          margin-right: 0 !important;
          width: 1280px !important;
          max-width: 1280px !important;
          padding: 24px !important;
          background-color: #ffffff !important;
        }
        /* Expand any scrollable/capped containers so full content is captured */
        #dashboard-pdf-area [class*="overflow-y-auto"],
        #dashboard-pdf-area [class*="max-h-"] {
          max-height: none !important;
          height: auto !important;
          overflow-y: visible !important;
          overflow: visible !important;
        }
        #dashboard-pdf-area [class*="overflow-x-auto"] {
          overflow-x: visible !important;
          overflow: visible !important;
        }
      `;
      document.head.appendChild(styleTag);

      // Wait for React state (e.g. Overview all widgets visible) and styles to settle
      await new Promise((resolve) => setTimeout(resolve, 400));

      const element = document.getElementById("dashboard-pdf-area") || document.body;

      // Determine report title from argument or DOM heading
      let reportTitle = customTitle;
      if (!reportTitle) {
        const h1 = element.querySelector("h1");
        reportTitle = h1?.textContent?.trim() || "Executive Report";
      }

      // Dynamic import
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      // 2. Capture content at scale 2, fixed windowWidth 1280, backgroundColor #ffffff
      const canvas = await html2canvas(element, {
        scale: 2,
        windowWidth: 1280,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
      });

      // 1. Layout parameters: A4 portrait (mm), 10mm margins
      const PAGE_WIDTH_MM = 210;
      const PAGE_HEIGHT_MM = 297;
      const MARGIN_MM = 10;
      const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - MARGIN_MM * 2; // 190 mm
      const HEADER_BOTTOM_MM = 22; // Header ends at 22 mm
      const CONTENT_TOP_MM = 25; // Content starts at 25 mm
      const FOOTER_TOP_MM = 284; // Footer starts at 284 mm
      const MAX_CONTENT_HEIGHT_MM = FOOTER_TOP_MM - CONTENT_TOP_MM; // 259 mm

      // Slicing and scaling conversions
      const domWidth = element.offsetWidth || 1280;
      const domHeight = element.scrollHeight || element.offsetHeight;
      const mmPerDomPx = CONTENT_WIDTH_MM / domWidth;
      const maxDomHeightPerPage = MAX_CONTENT_HEIGHT_MM / mmPerDomPx;
      const canvasScale = canvas.width / domWidth;

      // 3. Collect break points from [data-pdf-block] and table rows
      const containerRect = element.getBoundingClientRect();
      const rawBlocks: { top: number; bottom: number }[] = [];

      const blockElements = element.querySelectorAll("[data-pdf-block], tr");
      blockElements.forEach((el) => {
        const r = el.getBoundingClientRect();
        const top = r.top - containerRect.top;
        const bottom = r.bottom - containerRect.top;
        if (bottom > top && top >= 0) {
          rawBlocks.push({ top, bottom });
        }
      });
      rawBlocks.sort((a, b) => a.top - b.top);

      // Calculate slice boundaries
      interface Slice {
        top: number;
        bottom: number;
      }
      const slices: Slice[] = [];
      let currentTop = 0;

      while (currentTop < domHeight - 5) {
        const targetBottom = currentTop + maxDomHeightPerPage;

        // If the remaining content fits on this page, capture the rest
        if (targetBottom >= domHeight - 10) {
          slices.push({ top: currentTop, bottom: domHeight });
          break;
        }

        // Search for cards/elements that finish before targetBottom
        const candidates = rawBlocks.filter(
          (b) => b.bottom <= targetBottom && b.bottom > currentTop + 100
        );

        let cutPoint = targetBottom;
        if (candidates.length > 0) {
          // Select the candidate whose bottom edge is closest to targetBottom
          const best = candidates.reduce((prev, curr) =>
            curr.bottom > prev.bottom ? curr : prev
          );
          // Split slightly below card bottom (in the gap between cards)
          cutPoint = Math.min(targetBottom, best.bottom + 12);
        }

        slices.push({ top: currentTop, bottom: cutPoint });
        currentTop = cutPoint;
      }

      if (slices.length === 0 && domHeight > 0) {
        slices.push({ top: 0, bottom: domHeight });
      }

      // Initialize A4 portrait document
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const totalPages = Math.max(1, slices.length);
      const dateStr = new Date().toISOString().split("T")[0];

      // Draw each page slice onto PDF
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage("a4", "portrait");
        }

        const slice = slices[i] || { top: 0, bottom: domHeight };
        const sliceDomHeight = slice.bottom - slice.top;
        const sourceY = Math.round(slice.top * canvasScale);
        const sourceH = Math.min(
          Math.round(sliceDomHeight * canvasScale),
          canvas.height - sourceY
        );

        if (sourceH > 0) {
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sourceH;
          const ctx = sliceCanvas.getContext("2d");
          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(
              canvas,
              0,
              sourceY,
              canvas.width,
              sourceH,
              0,
              0,
              sliceCanvas.width,
              sourceH
            );

            const sliceImgData = sliceCanvas.toDataURL("image/png");
            const sliceHeightMm = sliceDomHeight * mmPerDomPx;

            pdf.addImage(
              sliceImgData,
              "PNG",
              MARGIN_MM,
              CONTENT_TOP_MM,
              CONTENT_WIDTH_MM,
              sliceHeightMm,
              undefined,
              "FAST"
            );
          }
        }
      }

      // 4. Draw Header and Footer on each page
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);

        // Header: Report Title
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.setTextColor(15, 23, 42); // slate-900
        pdf.text(reportTitle, MARGIN_MM, 13.5);

        // Header: Brand logo / title
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor(79, 70, 229); // indigo-600
        pdf.text("RETAIL DATA HUB", PAGE_WIDTH_MM - MARGIN_MM, 13.5, { align: "right" });

        // Header: Metadata subtitle
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139); // slate-500
        pdf.text(
          `Scope: ${selectedStore.name}   |   Date: ${dateStr}`,
          MARGIN_MM,
          18
        );

        // Header Divider Line
        pdf.setDrawColor(226, 232, 240); // slate-200
        pdf.setLineWidth(0.25);
        pdf.line(MARGIN_MM, HEADER_BOTTOM_MM, PAGE_WIDTH_MM - MARGIN_MM, HEADER_BOTTOM_MM);

        // Footer Divider Line
        pdf.line(MARGIN_MM, FOOTER_TOP_MM, PAGE_WIDTH_MM - MARGIN_MM, FOOTER_TOP_MM);

        // Footer: Left Label
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.text(
          "Retail Data Hub - Executive Intelligence Document",
          MARGIN_MM,
          FOOTER_TOP_MM + 5
        );

        // Footer: Page Number (Page X of Y)
        pdf.setTextColor(100, 116, 139); // slate-500
        pdf.text(
          `Page ${p} of ${totalPages}`,
          PAGE_WIDTH_MM - MARGIN_MM,
          FOOTER_TOP_MM + 5,
          { align: "right" }
        );
      }

      // 7. File name format: {title}-{YYYY-MM-DD}.pdf
      const cleanTitle = reportTitle
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const outputFilename = `${cleanTitle || "Retail-Report"}-${dateStr}.pdf`;

      pdf.save(outputFilename);
      showToast(`PDF report exported as ${outputFilename}`, "success");
    } catch (err) {
      console.error("Failed to generate PDF", err);
      showToast("Failed to generate PDF report. Please try again.", "error");
    } finally {
      if (styleTag && styleTag.parentNode) {
        styleTag.parentNode.removeChild(styleTag);
      }
      window.scrollTo(scrollX, scrollY);
      setIsExportingPdf(false);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        selectedStore,
        setSelectedStore,
        storeOptions,
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
