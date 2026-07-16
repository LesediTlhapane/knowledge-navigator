import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, Lock, LockOpen, ShieldCheck, Trash2, Upload } from "lucide-react";
import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBytes, useRepo } from "@/lib/repo-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Document Repository · eStudy Orchestrator" },
      {
        name: "description",
        content:
          "Secure research document repository with per-file locking and POPIA/FSCA redaction controls.",
      },
    ],
  }),
  component: RepositoryPage,
});

function RepositoryPage() {
  const { docs, redactionEnforced, setRedaction, addDocs, toggleLock, removeDoc } = useRepo();
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const list = Array.from(files);
      addDocs(list);
      toast.success(`${list.length} document${list.length > 1 ? "s" : ""} uploaded`, {
        description: "Indexed into the private knowledge repository.",
      });
    },
    [addDocs],
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <BrandHeader
        eyebrow="Document Repository"
        title="Private Research & Knowledge Vault"
        description="Upload internal research, lock proprietary files from the RAG retriever, and enforce POPIA/FSCA-aligned redaction before any payload leaves this workspace."
        actions={
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
            {docs.length} document{docs.length === 1 ? "" : "s"} indexed
          </div>
        }
      />

      <Card className="border-border/70">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <Label htmlFor="redact" className="text-sm font-semibold text-foreground">
                Enforce Sensitive Data Redaction (POPIA / FSCA Compliance)
              </Label>
              <p className="mt-1 max-w-xl text-xs text-muted-foreground">
                Strips client names, employee IDs, and personal identifiers from every payload
                dispatched to the n8n pipeline. Recommended for all production runs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-xs font-medium",
                redactionEnforced ? "text-accent" : "text-muted-foreground",
              )}
            >
              {redactionEnforced ? "Active" : "Disabled"}
            </span>
            <Switch id="redact" checked={redactionEnforced} onCheckedChange={setRedaction} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Upload Research Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all",
              dragOver
                ? "border-accent bg-accent/5"
                : "border-border bg-muted/40 hover:border-primary/50 hover:bg-muted/70",
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Drop PDF or Word files here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or click to browse · Max 100 MB per file · .pdf, .docx, .doc
              </p>
            </div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={(e) => {
                onFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
          <CardTitle className="text-base">Document Repository</CardTitle>
          <Badge variant="outline" className="border-primary/30 text-primary">
            {docs.filter((d) => d.status === "unlocked").length} available to RAG
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-primary/95 hover:bg-primary/95">
                <TableHead className="text-primary-foreground">Document Name</TableHead>
                <TableHead className="text-primary-foreground">Upload Date</TableHead>
                <TableHead className="text-primary-foreground">File Size</TableHead>
                <TableHead className="text-primary-foreground">Status</TableHead>
                <TableHead className="text-right text-primary-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {docs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                    No documents yet — upload research to get started.
                  </TableCell>
                </TableRow>
              )}
              {docs.map((doc) => {
                const locked = doc.status === "locked";
                return (
                  <TableRow
                    key={doc.id}
                    className={cn(
                      "transition-opacity",
                      locked && "bg-muted/40 opacity-60",
                    )}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{doc.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(doc.uploadedAt).toLocaleDateString("en-ZA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatBytes(doc.size)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {locked ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <LockOpen className="h-4 w-4 text-accent" />
                        )}
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[11px] font-medium",
                            locked
                              ? "border-muted-foreground/40 text-muted-foreground"
                              : "border-accent/40 bg-accent/10 text-accent",
                          )}
                        >
                          {locked ? "Locked" : "Unlocked"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Lock
                          </span>
                          <Switch
                            checked={locked}
                            onCheckedChange={() => {
                              toggleLock(doc.id);
                              toast(
                                locked
                                  ? `Unlocked "${doc.name}" for retrieval`
                                  : `Locked "${doc.name}" — hidden from RAG`,
                              );
                            }}
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            removeDoc(doc.id);
                            toast(`Removed "${doc.name}"`);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
