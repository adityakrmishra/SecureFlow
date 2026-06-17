
"use client";

import { MOCK_FINDINGS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Info, ChevronRight, CheckCircle2, AlertOctagon, Terminal, Cpu } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FindingsPage() {
  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in slide-in-from-bottom-2">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight mb-2">Security Findings</h1>
        <p className="text-muted-foreground">Analysis of all detected issues across your organization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-card border-red-500/20 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold">4</div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Critical Secrets</div>
        </div>
        <div className="p-6 rounded-2xl glass-card border-orange-500/20 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold">12</div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Vulnerabilities</div>
        </div>
        <div className="p-6 rounded-2xl glass-card border-blue-500/20 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
            <Info className="w-6 h-6" />
          </div>
          <div className="text-2xl font-bold">28</div>
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Misconfigs</div>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Recent Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-4">
            {MOCK_FINDINGS.map((finding) => (
              <AccordionItem key={finding.id} value={finding.id} className="border border-white/10 rounded-xl overflow-hidden px-4">
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4 w-full text-left">
                    <div className={`p-2 rounded-lg ${
                      finding.severity === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                      finding.severity === 'HIGH' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-blue-500/10 text-blue-500'
                    }`}>
                      {finding.type === 'Secret' ? <AlertOctagon className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm mb-0.5">{finding.issue}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{finding.file}</div>
                    </div>
                    <Badge className={
                      finding.severity === 'CRITICAL' ? 'bg-red-500 text-white hover:bg-red-600' :
                      finding.severity === 'HIGH' ? 'bg-orange-500 text-white hover:bg-orange-600' :
                      'bg-blue-500 text-white hover:bg-blue-600'
                    }>
                      {finding.severity}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pl-12 pr-4">
                    <div className="space-y-6">
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                          <Cpu className="w-10 h-10 text-primary opacity-10 group-hover:opacity-30 transition-opacity" />
                        </div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Cpu className="w-3 h-3" /> AI Security Explanation
                        </h4>
                        <p className="text-sm leading-relaxed text-foreground/90 italic">
                          "{finding.explanation}"
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold text-green-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> Remediation Steps
                        </h4>
                        <div className="text-sm text-muted-foreground leading-relaxed p-4 bg-white/5 border border-white/5 rounded-xl">
                          {finding.remediation}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Terminal className="w-3 h-3" /> Source Context
                      </h4>
                      <div className="bg-black/40 rounded-xl p-6 font-mono text-[10px] text-primary/80 border border-white/5 overflow-x-auto whitespace-pre">
{`10 |  // Initialization
11 |  export const API_CONFIG = {
12 |    key: 'sk-proj-7832X...8391', // FINDING
13 |    endpoint: 'https://api.openai.com/v1',
14 |    timeout: 30000
15 |  };`}
                      </div>
                      <div className="flex justify-end gap-3">
                        <Button variant="outline" size="sm" className="text-xs h-8 border-white/10 hover:bg-white/5">
                          Ignore Finding
                        </Button>
                        <Button size="sm" className="text-xs h-8 bg-primary text-background hover:bg-primary/90">
                          Create GitHub Issue
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
