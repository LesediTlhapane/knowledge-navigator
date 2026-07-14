import { createContext, useContext, useState, type ReactNode } from "react";

export type DocStatus = "unlocked" | "locked";

export interface RepoDoc {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  status: DocStatus;
}

interface RepoState {
  docs: RepoDoc[];
  redactionEnforced: boolean;
  webhookUrl: string;
  addDocs: (files: File[]) => void;
  toggleLock: (id: string) => void;
  removeDoc: (id: string) => void;
  setRedaction: (v: boolean) => void;
  setWebhookUrl: (v: string) => void;
}

const RepoCtx = createContext<RepoState | null>(null);

const seed: RepoDoc[] = [
  {
    id: "seed-1",
    name: "SAQA_NQF_Framework_Overview.pdf",
    size: 2_413_056,
    uploadedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    status: "unlocked",
  },
  {
    id: "seed-2",
    name: "POPIA_Compliance_Handbook_2025.pdf",
    size: 1_842_112,
    uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: "unlocked",
  },
  {
    id: "seed-3",
    name: "FSCA_Financial_Rep_Conduct_Notes.docx",
    size: 512_003,
    uploadedAt: new Date(Date.now() - 86400000).toISOString(),
    status: "locked",
  },
];

export function RepoProvider({ children }: { children: ReactNode }) {
  const [docs, setDocs] = useState<RepoDoc[]>(seed);
  const [redactionEnforced, setRedaction] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState(
    "https://n8n.estudy.co.za/webhook/course-orchestrator",
  );

  const addDocs = (files: File[]) => {
    const now = new Date().toISOString();
    setDocs((prev) => [
      ...files.map((f, i) => ({
        id: `${Date.now()}-${i}-${f.name}`,
        name: f.name,
        size: f.size,
        uploadedAt: now,
        status: "unlocked" as DocStatus,
      })),
      ...prev,
    ]);
  };

  const toggleLock = (id: string) =>
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: d.status === "locked" ? "unlocked" : "locked" } : d,
      ),
    );

  const removeDoc = (id: string) =>
    setDocs((prev) => prev.filter((d) => d.id !== id));

  return (
    <RepoCtx.Provider
      value={{
        docs,
        redactionEnforced,
        webhookUrl,
        addDocs,
        toggleLock,
        removeDoc,
        setRedaction,
        setWebhookUrl,
      }}
    >
      {children}
    </RepoCtx.Provider>
  );
}

export function useRepo() {
  const ctx = useContext(RepoCtx);
  if (!ctx) throw new Error("useRepo must be used within RepoProvider");
  return ctx;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}