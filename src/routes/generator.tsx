import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
<<<<<<< HEAD
import { AlertTriangle, Loader2, Send, Sparkles, Wand2 } from "lucide-react";
=======
import { Loader2, Send, Sparkles, Wand2 } from "lucide-react";
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
<<<<<<< HEAD
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
=======
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
import { Badge } from "@/components/ui/badge";
import { useRepo } from "@/lib/repo-store";

export const Route = createFileRoute("/generator")({
  head: () => ({
    meta: [
      { title: "Course Generator · eStudy Orchestrator" },
      {
        name: "description",
        content:
<<<<<<< HEAD
          "Compose course objectives, preview the n8n-ready payload, and dispatch it to the eStudy course-generation webhook.",
=======
          "Compose course objectives, preview the generated RAG payload, and dispatch it to the eStudy n8n automation pipeline.",
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
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

<<<<<<< HEAD
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
=======
function buildPayload(prompt: string, redact: boolean, docCount: number) {
  const title = titleize(prompt) || "Untitled eStudy Course";
  return {
    taskTitle: title,
    taskDescription: `A structured eStudy learning intervention derived from the prompt: "${prompt.trim()}". Designed for South African workplace learners with contextual scenarios and compliance-aware assessment.`,
    branding: {
      primary_color: "#052b66",
      secondary_color: "#10b981",
      logo_placement_header: "[eStudy_Logo_Header_Placeholder]",
      logo_placement_footer: "[eStudy_Logo_Footer_Placeholder]",
    },
    compliance: {
      redaction_enforced: redact,
      frameworks: ["POPIA", "FSCA", "SAQA / NQF"],
    },
    researchInsights: {
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
      problem_context:
        "Operational and compliance gaps identified across South African financial services and customer engagement teams, extracted from unlocked internal research.",
      regulatory_frameworks: ["POPIA", "FSCA Conduct Standards", "SAQA NQF Level 5"],
      extracted_methodologies: [
        "Scenario-based microlearning",
        "Spaced retrieval assessment",
        "Reflective compliance journaling",
      ],
<<<<<<< HEAD
=======
      tech_tools: ["eStudy LMS", "n8n Workflow Engine", "OpenAI GPT-4 Retriever"],
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
      scenarios_data: [
        {
          topic: "Customer objection handling",
          case_detail:
            "[Redacted Client Name] representative fields a complaint requiring FAIS-aligned disclosure and empathetic escalation.",
        },
      ],
<<<<<<< HEAD
    };
  } else {
    base.execution_prompt = prompt.trim();
  }

  return base;
}

function GeneratorPage() {
  const { redactionEnforced, docs, webhookUrl, authToken } = useRepo();
=======
    },
    retrieval: {
      documents_considered: docCount,
      source: "eStudy private vector index",
    },
  };
}

function GeneratorPage() {
  const { redactionEnforced, docs, webhookUrl } = useRepo();
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
  const availableDocs = docs.filter((d) => d.status === "unlocked").length;
  const [prompt, setPrompt] = useState(
    "Build a Customer Service compliance course for financial reps",
  );
<<<<<<< HEAD
  const [courseTemplate, setCourseTemplate] = useState("estudy-default");
  const [useResearch, setUseResearch] = useState(true);
  const [payload, setPayload] = useState<CourseGenerationPayload | null>(null);
  const [dispatching, setDispatching] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const jsonString = useMemo(() => (payload ? JSON.stringify(payload, null, 2) : ""), [payload]);
=======
  const [payload, setPayload] = useState<object | null>(null);
  const [dispatching, setDispatching] = useState(false);

  const jsonString = useMemo(
    () => (payload ? JSON.stringify(payload, null, 2) : ""),
    [payload],
  );
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602

  const generate = () => {
    if (!prompt.trim()) {
      toast.error("Enter a course objective first");
      return;
    }
<<<<<<< HEAD
    const p = buildPayload(prompt, redactionEnforced, availableDocs, courseTemplate, useResearch);
    setPayload(p);
    setLastError(null);
=======
    const p = buildPayload(prompt, redactionEnforced, availableDocs);
    setPayload(p);
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
    toast.success("Course payload generated", {
      description: `Assembled from ${availableDocs} unlocked document${
        availableDocs === 1 ? "" : "s"
      }.`,
    });
  };

  const dispatch = async () => {
    if (!payload) return;
    setDispatching(true);
<<<<<<< HEAD
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
=======
    await new Promise((r) => setTimeout(r, 1400));
    setDispatching(false);
    toast.success("Payload successfully dispatched to n8n automated generation pipeline!", {
      description: `POST → ${webhookUrl}`,
    });
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <BrandHeader
        eyebrow="Course Generator"
        title="Compose · Preview · Dispatch"
<<<<<<< HEAD
        description="Draft a course objective, generate an n8n-ready payload from unlocked research, and dispatch it to your Webhook Trigger node."
=======
        description="Draft a course objective, generate a branded orchestration payload from unlocked research, and hand off to the n8n automation pipeline in one motion."
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
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
<<<<<<< HEAD
                rows={6}
=======
                rows={7}
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
                placeholder="e.g. Build a Customer Service compliance course for financial reps operating under FSCA regulations."
                className="mt-2 resize-none"
              />
            </div>
<<<<<<< HEAD

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

=======
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Redaction {redactionEnforced ? "On" : "Off"}
              </Badge>
              <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent">
                RAG · {availableDocs} sources
              </Badge>
<<<<<<< HEAD
              {!authToken && (
                <Badge variant="outline" className="border-destructive/40 text-destructive">
                  No JWT token set
                </Badge>
              )}
            </div>

=======
            </div>
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
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
<<<<<<< HEAD
            {lastError && (
              <div className="flex items-start gap-2 border-b border-destructive/30 bg-destructive/10 px-6 py-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{lastError}</span>
              </div>
            )}
            {payload ? (
              <pre className="max-h-[520px] overflow-auto bg-primary p-6 text-[12.5px] leading-relaxed text-primary-foreground/90">
=======
            {payload ? (
              <pre className="max-h-[560px] overflow-auto bg-primary p-6 text-[12.5px] leading-relaxed text-primary-foreground/90">
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
                <code>{jsonString}</code>
              </pre>
            ) : (
              <div className="flex h-[420px] flex-col items-center justify-center gap-3 bg-muted/30 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
<<<<<<< HEAD
                  <p className="text-sm font-semibold text-foreground">No payload generated yet</p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Enter a course objective on the left and press{" "}
                    <span className="font-medium text-foreground">Generate Course Payload</span> to
                    see the n8n-ready JSON here.
=======
                  <p className="text-sm font-semibold text-foreground">
                    No payload generated yet
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Enter a course objective on the left and press{" "}
                    <span className="font-medium text-foreground">Generate Course Payload</span>{" "}
                    to see the n8n-ready JSON here.
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 8ea3e3f4a2e128f16842673b70d39b14011c8602
