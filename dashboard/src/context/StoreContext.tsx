"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [storeOptions, setStoreOptions] = useState<StoreOption[]>([DEFAULT_STORE]);
  const [selectedStore, setSelectedStore] = useState<StoreOption>(DEFAULT_STORE);
  const [isCmdKOpen, setIsCmdKOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAlertConfigOpen, setIsAlertConfigOpen] = useState(false);

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
