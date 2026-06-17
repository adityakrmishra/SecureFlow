
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShieldAlert, 
  GitPullRequest, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  AlertTriangle,
  Zap
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { MOCK_STATS, MOCK_CHART_DATA, MOCK_PRS } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export default function OverviewPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight mb-1">Risk Overview</h1>
          <p className="text-muted-foreground">Monitoring 4 active repositories across Acme Corp.</p>
        </div>
        <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/10">
          <Badge variant="outline" className="border-green-500/30 text-green-400 bg-green-500/5">System Healthy</Badge>
          <div className="h-4 w-px bg-white/10 mx-2" />
          <span className="text-xs font-mono text-muted-foreground">LAST SCAN: 2M AGO</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Scans" 
          value={MOCK_STATS.totalScans} 
          subValue="+12% from last week" 
          icon={<Zap className="w-5 h-5 text-primary" />} 
        />
        <StatCard 
          title="Blocked PRs" 
          value={MOCK_STATS.blockedPRs} 
          subValue="-2% from last week" 
          icon={<AlertTriangle className="w-5 h-5 text-red-400" />} 
        />
        <StatCard 
          title="Approved PRs" 
          value={MOCK_STATS.approvedPRs} 
          subValue="+8% from last week" 
          icon={<CheckCircle className="w-5 h-5 text-green-400" />} 
        />
        <StatCard 
          title="Secrets Detected" 
          value={MOCK_STATS.secretsDetected} 
          subValue="4 Critical findings" 
          icon={<ShieldAlert className="w-5 h-5 text-orange-400" />} 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              Scan Activity
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-[10px] text-muted-foreground uppercase">Scans</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <span className="text-[10px] text-muted-foreground uppercase">Risk</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_CHART_DATA}>
                <defs>
                  <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 10}} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: 'white', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="scans" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorScans)" />
                <Area type="monotone" dataKey="risk" stroke="hsl(var(--secondary))" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Critical</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: '15%' }} />
                </div>
                <span className="text-xs font-bold w-6">4</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">High</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: '45%' }} />
                </div>
                <span className="text-xs font-bold w-6">12</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Medium</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500" style={{ width: '65%' }} />
                </div>
                <span className="text-xs font-bold w-6">28</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Low</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: '85%' }} />
                </div>
                <span className="text-xs font-bold w-6">86</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent PRs Table */}
      <Card className="glass-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold">Recent Pull Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_PRS.map((pr) => (
              <div key={pr.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${
                    pr.status === 'BLOCKED' ? 'bg-red-500/10 text-red-400' :
                    pr.status === 'PASS' ? 'bg-green-500/10 text-green-400' :
                    'bg-yellow-500/10 text-yellow-400'
                  }`}>
                    <GitPullRequest className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm mb-1 flex items-center gap-2">
                      {pr.title}
                      <Badge variant="secondary" className="text-[10px] py-0">#{pr.number}</Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1 uppercase tracking-widest"><Clock className="w-3 h-3" /> {pr.time}</span>
                      <span className="flex items-center gap-1 uppercase tracking-widest text-primary"><ShieldAlert className="w-3 h-3" /> {pr.author}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] uppercase text-muted-foreground mb-1 font-bold">Risk Level</div>
                    <div className={`text-xs font-bold ${
                      pr.severity === 'CRITICAL' ? 'text-red-400' :
                      pr.severity === 'MEDIUM' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>{pr.severity}</div>
                  </div>
                  <div className="h-8 w-px bg-white/10 hidden sm:block" />
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-bold ${
                      pr.status === 'BLOCKED' ? 'text-red-400' :
                      pr.status === 'PASS' ? 'text-green-400' :
                      'text-yellow-400'
                    }`}>{pr.status}</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, subValue, icon }: { title: string, value: number | string, subValue: string, icon: React.ReactNode }) {
  return (
    <Card className="glass-card overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
        {icon}
      </div>
      <CardContent className="p-6">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold font-headline">{value}</h3>
          <span className="text-[10px] text-green-400 font-semibold">{subValue}</span>
        </div>
      </CardContent>
      <div className="h-1 w-full bg-white/5 overflow-hidden">
        <div className="h-full bg-primary animate-scan-line" />
      </div>
    </Card>
  );
}
