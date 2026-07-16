import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
  authToken: string;
  addDocs: (files: File[]) => void;
  toggleLock: (id: string) => void;
  removeDoc: (id: string) => void;
  setRedaction: (v: boolean) => void;
  setWebhookUrl: (v: string) => void;
  setAuthToken: (v: string) => void;
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

const DEFAULT_WEBHOOK_URL = "https://leseditlhapane.app.n8n.cloud/webhook/course-generation";

// Small localStorage helpers. Guarded so this still works during SSR
// (TanStack Start renders on the server first, where `window` doesn't exist).
function readStored(key: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore (private browsing, storage disabled, etc.)
  }
}

export function RepoProvider({ children }: { children: ReactNode }) {
  const [docs, setDocs] = useState<RepoDoc[]>(seed);
  const [redactionEnforced, setRedaction] = useState(true);
  const [webhookUrl, setWebhookUrlState] = useState(DEFAULT_WEBHOOK_URL);
  const [authToken, setAuthTokenState] = useState("");

  // Hydrate from localStorage once we're on the client, so the webhook URL
  // and JWT token survive a page refresh instead of resetting every time.
  useEffect(() => {
    setWebhookUrlState(readStored("estudy.webhookUrl", DEFAULT_WEBHOOK_URL));
    setAuthTokenState(readStored("estudy.authToken", ""));
  }, []);

  const setWebhookUrl = (v: string) => {
    setWebhookUrlState(v);
    writeStored("estudy.webhookUrl", v);
  };

  const setAuthToken = (v: string) => {
    setAuthTokenState(v);
    writeStored("estudy.authToken", v);
  };

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

  const removeDoc = (id: string) => setDocs((prev) => prev.filter((d) => d.id !== id));

  return (
    <RepoCtx.Provider
      value={{
        docs,
        redactionEnforced,
        webhookUrl,
        authToken,
        addDocs,
        toggleLock,
        removeDoc,
        setRedaction,
        setWebhookUrl,
        setAuthToken,
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
