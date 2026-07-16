import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Send, Sparkles, Wand2 } from "lucide-react";
import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useRepo } from "@/lib/repo-store";

export const Route = createFileRoute("/generator")({
  head: () => ({
    meta: [
      { title: "Course Generator · eStudy Orchestrator" },
      {
        name: "description",
        content:
          "Compose course objectives, preview the n8n-ready payload, and dispatch it to the eStudy course-generation webhook.",
      },
    ],
  }),
  component: GeneratorPage,
});

function titleize(prompt: string) {
  const trimmed = prompt.trim().replace(/^(build|create|design|make)\s+(a\s+)?/i, "");
  const clean = trimmed.replace(/[.!?]+$/, "");
  const words = clean.split(/\s+/).slice(0, 10);
  return words
    .map((w, i) => (i === 0 || w.length > 3 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function makeId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// This shape mirrors exactly what the "Validate Payload" / "Normalize Payload"
// nodes in the n8n workflow (Webhook Trigger -> Validate Payload -> Normalize
// Payload) expect. Field names must match verbatim or validation fails.
interface CourseGenerationPayload {
  job_id: string;
  task_id: string;
  course_title: string;
  course_description?: string;
  course_template: string;
  use_research: boolean;
  direct_generation: boolean;
  research_package?: Record<string, unknown>;
  execution_prompt?: string;
  metadata?: Record<string, unknown>;
}

function buildPayload(
  prompt: string,
  redact: boolean,
  docCount: number,
  courseTemplate: string,
  useResearch: boolean,
): CourseGenerationPayload {
  const title = titleize(prompt) || "Untitled eStudy Course";
  const base: CourseGenerationPayload = {
    job_id: makeId("job"),
    task_id: makeId("task"),
    course_title: title,
    course_description: `A structured eStudy learning intervention derived from the prompt: "${prompt.trim()}". Designed for South African workplace learners with contextual scenarios and compliance-aware assessment.`,
    course_template: courseTemplate.trim() || "estudy-default",
    use_research: useResearch,
    direct_generation: false,
    metadata: {
      branding: {
        primary_color: "#052b66",
        secondary_color: "#10b981",
      },
      compliance: {
        redaction_enforced: redact,
        frameworks: ["POPIA", "FSCA", "SAQA / NQF"],
      },
      retrieval: {
        documents_considered: docCount,
        source: "eStudy private vector index",
      },
    },
  };

  if (useResearch) {
    base.research_package = {
      problem_context:
        "Operational and compliance gaps identified across South African financial services and customer engagement teams, extracted from unlocked internal research.",
      regulatory_frameworks: ["POPIA", "FSCA Conduct Standards", "SAQA NQF Level 5"],
      extracted_methodologies: [
        "Scenario-based microlearning",
        "Spaced retrieval assessment",
        "Reflective compliance journaling",
      ],
      scenarios_data: [
        {
          topic: "Customer objection handling",
          case_detail:
            "[Redacted Client Name] representative fields a complaint requiring FAIS-aligned disclosure and empathetic escalation.",
        },
      ],
    };
  } else {
    base.execution_prompt = prompt.trim();
  }

  return base;
}

function GeneratorPage() {
  const { redactionEnforced, docs, webhookUrl, authToken } = useRepo();
  const availableDocs = docs.filter((d) => d.status === "unlocked").length;
  const [prompt, setPrompt] = useState(
    "Build a Customer Service compliance course for financial reps",
  );
  const [courseTemplate, setCourseTemplate] = useState("estudy-default");
  const [useResearch, setUseResearch] = useState(true);
  const [payload, setPayload] = useState<CourseGenerationPayload | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const jsonString = useMemo(() => (payload ? JSON.stringify(payload, null, 2) : ""), [payload]);

  const generate = () => {
    if (!prompt.trim()) {
      toast.error("Enter a course objective first");
      return;
    }
    const p = buildPayload(prompt, redactionEnforced, availableDocs, courseTemplate, useResearch);
    setPayload(p);
    setLastError(null);
    toast.success("Course payload generated", {
      description: `Assembled from ${availableDocs} unlocked document${
        availableDocs === 1 ? "" : "s"
      }.`,
    });
  };

  const dispatch = async () => {
    if (!payload) return;
    setDispatching(true);
    setLastError(null);

    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let parsed: unknown = text;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        // response wasn't JSON — keep raw text
      }

      if (!res.ok) {
        const message =
          typeof parsed === "object" && parsed !== null && "message" in (parsed as object)
            ? String((parsed as { message: unknown }).message)
            : `HTTP ${res.status} ${res.statusText}`;
        throw new Error(message);
      }

      toast.success("Payload accepted by n8n", {
        description: `POST ${webhookUrl} → ${res.status}`,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setLastError(message);
      toast.error("Dispatch failed", {
        description:
          message === "Failed to fetch"
            ? "Network/CORS error — check the webhook URL, that n8n is reachable, and that the workflow is active."
            : message,
      });
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <BrandHeader
        eyebrow="Course Generator"
        title="Compose · Preview · Dispatch"
        description="Draft a course objective, generate an n8n-ready payload from unlocked research, and dispatch it to your Webhook Trigger node."
        actions={
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs backdrop-blur">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
            {availableDocs} document{availableDocs === 1 ? "" : "s"} available to RAG
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/70 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="h-4 w-4 text-primary" />
              Course Request
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                User Prompt / Course Objective
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                placeholder="e.g. Build a Customer Service compliance course for financial reps operating under FSCA regulations."
                className="mt-2 resize-none"
              />
            </div>

            <div>
              <Label
                htmlFor="course_template"
                className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                course_template
              </Label>
              <Input
                id="course_template"
                value={courseTemplate}
                onChange={(e) => setCourseTemplate(e.target.value)}
                placeholder="estudy-default"
                className="mt-2"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Must match whatever your Master Course Builder / DOCX generation step expects.
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Use research package</p>
                <p className="text-[11px] text-muted-foreground">
                  On: sends <code>research_package</code>. Off: sends your prompt as{" "}
                  <code>execution_prompt</code> instead.
                </p>
              </div>
              <Button
                type="button"
                variant={useResearch ? "default" : "outline"}
                size="sm"
                onClick={() => setUseResearch((v) => !v)}
              >
                {useResearch ? "Research" : "Prompt"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Redaction {redactionEnforced ? "On" : "Off"}
              </Badge>
              <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent">
                RAG · {availableDocs} sources
              </Badge>
              {!authToken && (
                <Badge variant="outline" className="border-destructive/40 text-destructive">
                  No JWT token set
                </Badge>
              )}
            </div>

            <Button onClick={generate} size="lg" className="mt-2 gap-2">
              <Sparkles className="h-4 w-4" />
              Generate Course Payload
            </Button>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70 lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-3">
            <CardTitle className="text-base">JSON Preview & Dispatch</CardTitle>
            <Button
              onClick={dispatch}
              disabled={!payload || dispatching}
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {dispatching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Dispatching…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send to n8n Webhook
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {lastError && (
              <div className="flex items-start gap-2 border-b border-destructive/30 bg-destructive/10 px-6 py-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{lastError}</span>
              </div>
            )}
            {payload ? (
              <pre className="max-h-[520px] overflow-auto bg-primary p-6 text-[12.5px] leading-relaxed text-primary-foreground/90">
                <code>{jsonString}</code>
              </pre>
            ) : (
              <div className="flex h-[420px] flex-col items-center justify-center gap-3 bg-muted/30 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">No payload generated yet</p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Enter a course objective on the left and press{" "}
                    <span className="font-medium text-foreground">Generate Course Payload</span> to
                    see the n8n-ready JSON here.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
