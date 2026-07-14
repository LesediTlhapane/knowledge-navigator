import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Webhook } from "lucide-react";
import { BrandHeader } from "@/components/brand-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRepo } from "@/lib/repo-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "n8n Integration Settings · eStudy Orchestrator" },
      {
        name: "description",
        content:
          "Configure the n8n webhook endpoint, retry policy, and signature secret used by the eStudy course orchestrator.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { webhookUrl, setWebhookUrl } = useRepo();
  const [secret, setSecret] = useState("••••••••••••••••");
  const [retry, setRetry] = useState(true);
  const [verify, setVerify] = useState(true);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6 lg:p-8">
      <BrandHeader
        eyebrow="n8n Integration"
        title="Automation Pipeline Configuration"
        description="Point the orchestrator at your n8n workflow, sign every payload with a shared HMAC secret, and choose how failures are retried."
      />

      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Webhook className="h-4 w-4 text-primary" />
            Webhook Endpoint
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="webhook">Production webhook URL</Label>
            <Input
              id="webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://n8n.example.com/webhook/xyz"
            />
            <p className="text-xs text-muted-foreground">
              Payloads generated in the Course Generator are POSTed to this URL.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="secret">HMAC signing secret</Label>
            <Input
              id="secret"
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <ToggleRow
              label="Automatic retry on 5xx"
              description="Exponentially retry failed dispatches up to 3 times."
              checked={retry}
              onChange={setRetry}
            />
            <ToggleRow
              label="Verify webhook response signature"
              description="Reject responses that don't return a matching HMAC header."
              checked={verify}
              onChange={setVerify}
            />
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <div className="flex items-center gap-2 text-xs text-accent">
              <CheckCircle2 className="h-4 w-4" />
              Last successful dispatch · 2 minutes ago
            </div>
            <Button onClick={() => toast.success("Integration settings saved")}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}