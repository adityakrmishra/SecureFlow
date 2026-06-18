import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Lock, AlertCircle, ShieldCheck, HelpCircle, Plus, Terminal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ArmorIQService } from "@/lib/armor/iq";

// --- Server Actions ---

async function togglePolicy(formData: FormData) {
  "use server";
  const policyId = formData.get("policyId") as string;
  const currentState = formData.get("currentState") === "true";

  await prisma.policy.update({
    where: { id: policyId },
    data: { isActive: !currentState }
  });

  revalidatePath("/dashboard/policies");
}

async function createPolicy(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) return;

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const action = formData.get("action") as string;
  const severity = formData.get("severity") as string;
  const conditionsStr = formData.get("conditions") as string;

  // Split conditions by new line and remove empty strings
  const conditions = conditionsStr.split('\n').map(c => c.trim()).filter(c => c !== '');

  const rules = {
    description,
    action,
    severity,
    conditions
  };

  await prisma.policy.create({
    data: {
      name,
      rules,
      isActive: true, // New policies are active by default
      userId: session.user.id
    }
  });

  revalidatePath("/dashboard/policies");
}

// --- Page Component ---

export default async function PoliciesPage() {
  const session = await auth();
  
  if (!session?.user?.id || !session?.user?.email) {
    redirect("/api/auth/signin");
  }
  
  const userId = session.user.id;
  const userEmail = session.user.email;

  // 1. Fetch only this user's policies
  const policies = await prisma.policy.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  // 2. ArmorIQ SDK Integration
  const armoriqClient = ArmorIQService.getClient();
  const userScope = armoriqClient.forUser(userEmail); 
  const compiledPolicy = ArmorIQService.compileToArmorIQPolicy(policies);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight mb-2">ArmorIQ Policies</h1>
          <p className="text-muted-foreground">Define the automated logic used to protect your main branch.</p>
        </div>

        {/* New Policy Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-background hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> New Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px] glass-card border-white/10 bg-background/80 backdrop-blur-xl">
            <form action={createPolicy}>
              <DialogHeader>
                <DialogTitle>Create New Policy</DialogTitle>
                <DialogDescription>
                  Define new automated guardrails for your agent. These will be compiled into your intent tokens.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-5 py-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Policy Name</Label>
                  <Input id="name" name="name" placeholder="e.g., Restrict Production Deletes" required className="bg-black/20 border-white/10" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" placeholder="What does this rule do?" required className="bg-black/20 border-white/10" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="action">Action Type</Label>
                    <Select name="action" defaultValue="DENY">
                      <SelectTrigger className="bg-black/20 border-white/10">
                        <SelectValue placeholder="Select Action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALLOW">ALLOW</SelectItem>
                        <SelectItem value="REVIEW REQUIRED">REVIEW REQUIRED</SelectItem>
                        <SelectItem value="DENY">DENY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select name="severity" defaultValue="HIGH">
                      <SelectTrigger className="bg-black/20 border-white/10">
                        <SelectValue placeholder="Select Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">LOW</SelectItem>
                        <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                        <SelectItem value="HIGH">HIGH</SelectItem>
                        <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conditions">Glob Pattern Conditions</Label>
                  <Textarea 
                    id="conditions" 
                    name="conditions" 
                    placeholder="data-mcp/delete_*&#10;admin-mcp/*" 
                    className="bg-black/20 border-white/10 min-h-[100px] resize-none" 
                    required 
                  />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Enter one rule pattern per line.</p>
                </div>
              </div>
              
              <DialogFooter>
                {/* Note: Next.js standard form submission triggers a revalidatePath, which naturally closes the dialog. */}
                <Button type="submit" className="w-full sm:w-auto">Save Policy</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ArmorIQ SDK Integration Preview */}
      <Card className="glass-card bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">ArmorIQ Programmatic Policy</CardTitle>
          </div>
          <CardDescription>
            Your active rules below are compiled dynamically into this execution guardrail for the agent scope: <strong className="text-white">{userEmail}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs p-4 bg-black/50 rounded-lg border border-white/10 text-muted-foreground overflow-x-auto">
            {JSON.stringify(compiledPolicy, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {policies.length === 0 && (
          <div className="col-span-2 text-center text-muted-foreground p-8 border border-dashed border-white/10 rounded-xl">
            No policies found. Create your first policy to get started.
          </div>
        )}
        
        {policies.map((policy) => {
          const rulesMeta = (policy.rules as any) || {};
          
          return (
            <PolicyCard 
              key={policy.id}
              id={policy.id}
              title={policy.name}
              description={rulesMeta.description || "Custom automated logic rule."}
              isActive={policy.isActive}
              severity={rulesMeta.severity || "MEDIUM"}
              action={rulesMeta.action || "REVIEW REQUIRED"}
              rules={rulesMeta.conditions || []}
            />
          );
        })}
      </div>
    </div>
  );
}

function PolicyCard({ id, title, description, isActive, severity, action, rules }: any) {
  return (
    <Card className={`glass-card relative overflow-hidden flex flex-col ${!isActive && 'opacity-60'}`}>
      <div className="absolute top-0 right-0 p-6 z-10">
        <form action={togglePolicy}>
          <input type="hidden" name="policyId" value={id} />
          <input type="hidden" name="currentState" value={String(isActive)} />
          <button type="submit" className="hover:opacity-80 transition-opacity">
             <Switch checked={isActive} className="pointer-events-none" aria-readonly />
          </button>
        </form>
      </div>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Lock className="w-5 h-5" />
          </div>
          <Badge variant="outline" className="text-[10px] tracking-widest">{action}</Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="space-y-2">
          {rules.length > 0 ? rules.map((rule: string, i: number) => (
            <div key={i} className="flex items-start gap-3 text-xs text-muted-foreground p-3 bg-white/5 border border-white/5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
              {rule}
            </div>
          )) : (
            <div className="text-xs text-muted-foreground italic">No conditions defined.</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-4 flex items-center justify-between border-t border-white/5 text-[10px] font-bold uppercase text-muted-foreground mt-auto">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3 h-3" /> Minimum Severity: {severity}
        </div>
        <button className="hover:text-white transition-colors flex items-center gap-1">
          Edit Rules <HelpCircle className="w-3 h-3" />
        </button>
      </CardFooter>
    </Card>
  );
}