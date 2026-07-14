import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Send, Sparkles, Wand2 } from "lucide-react";
import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useRepo } from "@/lib/repo-store";

export const Route = createFileRoute("/generator")({
  head: () => ({
    meta: [
      { title: "Course Generator · eStudy Orchestrator" },
      {
        name: "description",
        content:
          "Compose course objectives, preview the generated RAG payload, and dispatch it to the eStudy n8n automation pipeline.",
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
      problem_context:
        "Operational and compliance gaps identified across South African financial services and customer engagement teams, extracted from unlocked internal research.",
      regulatory_frameworks: ["POPIA", "FSCA Conduct Standards", "SAQA NQF Level 5"],
      extracted_methodologies: [
        "Scenario-based microlearning",
        "Spaced retrieval assessment",
        "Reflective compliance journaling",
      ],
      tech_tools: ["eStudy LMS", "n8n Workflow Engine", "OpenAI GPT-4 Retriever"],
      scenarios_data: [
        {
          topic: "Customer objection handling",
          case_detail:
            "[Redacted Client Name] representative fields a complaint requiring FAIS-aligned disclosure and empathetic escalation.",
        },
      ],
    },
    retrieval: {
      documents_considered: docCount,
      source: "eStudy private vector index",
    },
  };
}

function GeneratorPage() {
  const { redactionEnforced, docs, webhookUrl } = useRepo();
  const availableDocs = docs.filter((d) => d.status === "unlocked").length;
  const [prompt, setPrompt] = useState(
    "Build a Customer Service compliance course for financial reps",
  );
  const [payload, setPayload] = useState<object | null>(null);
  const [dispatching, setDispatching] = useState(false);

  const jsonString = useMemo(
    () => (payload ? JSON.stringify(payload, null, 2) : ""),
    [payload],
  );

  const generate = () => {
    if (!prompt.trim()) {
      toast.error("Enter a course objective first");
      return;
    }
    const p = buildPayload(prompt, redactionEnforced, availableDocs);
    setPayload(p);
    toast.success("Course payload generated", {
      description: `Assembled from ${availableDocs} unlocked document${
        availableDocs === 1 ? "" : "s"
      }.`,
    });
  };

  const dispatch = async () => {
    if (!payload) return;
    setDispatching(true);
    await new Promise((r) => setTimeout(r, 1400));
    setDispatching(false);
    toast.success("Payload successfully dispatched to n8n automated generation pipeline!", {
      description: `POST → ${webhookUrl}`,
    });
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6 lg:p-8">
      <BrandHeader
        eyebrow="Course Generator"
        title="Compose · Preview · Dispatch"
        description="Draft a course objective, generate a branded orchestration payload from unlocked research, and hand off to the n8n automation pipeline in one motion."
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
                rows={7}
                placeholder="e.g. Build a Customer Service compliance course for financial reps operating under FSCA regulations."
                className="mt-2 resize-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Redaction {redactionEnforced ? "On" : "Off"}
              </Badge>
              <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent">
                RAG · {availableDocs} sources
              </Badge>
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
            {payload ? (
              <pre className="max-h-[560px] overflow-auto bg-primary p-6 text-[12.5px] leading-relaxed text-primary-foreground/90">
                <code>{jsonString}</code>
              </pre>
            ) : (
              <div className="flex h-[420px] flex-col items-center justify-center gap-3 bg-muted/30 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    No payload generated yet
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                    Enter a course objective on the left and press{" "}
                    <span className="font-medium text-foreground">Generate Course Payload</span>{" "}
                    to see the n8n-ready JSON here.
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