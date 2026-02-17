"use client";

import { Activity, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { MetricCard } from "../components/dashboard/MetricCard";
import { ActiveFailuresList } from "../components/dashboard/ActiveFailuresList";
import { LiveLogs } from "../components/dashboard/LiveLogs";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-accent-500 font-bold uppercase tracking-wider text-xs mb-2">
            System Overview
          </div>
          <h1 className="text-4xl font-extrabold text-text-100 tracking-tight">
            Control Plane
          </h1>
          <p className="text-text-60 mt-2 max-w-2xl">
            Monitor system health and manage failure injections across microservices.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-red-500/20 transition-all flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Emergency Stop
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Failures"
          value={2}
          icon={Zap}
          variant="alert"
          description="2 services currently impacted"
          trend="+1"
          trendDirection="up"
        />
        <MetricCard
          title="System Health"
          value="98.2%"
          icon={Activity}
          variant="success"
          description="All critical systems operational"
          trend="+0.4%"
          trendDirection="up"
        />
        <MetricCard
          title="Global Error Rate"
          value="0.05%"
          icon={AlertTriangle}
          variant="default"
          description="Below threshold (1%)"
          trend="-0.01%"
          trendDirection="down" // Good thing
        />
        <MetricCard
          title="Services Online"
          value="12/12"
          icon={CheckCircle}
          variant="default"
          description="No outages detected"
        />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Failures Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <ActiveFailuresList />
          <LiveLogs />
        </div>

        {/* Recent History (1/3 width) */}
        <div className="space-y-6">
          <div className="rounded-xl bg-panel-700 p-6 border border-panel-600/50">
            <h3 className="font-bold text-text-100 mb-4">Recent Activity</h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-text-40 mt-1.5" />
                <div>
                  <span className="text-text-100 font-medium">Stopped Injection: </span>
                  <span className="text-text-60">Redis Latency on OTP Service</span>
                  <div className="text-[10px] text-text-40 mt-0.5">2 minutes ago • by User</div>
                </div>
              </li>
              <li className="flex gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5" />
                <div>
                  <span className="text-text-100 font-medium">Started Injection: </span>
                  <span className="text-text-60">Network Latency on Gateway</span>
                  <div className="text-[10px] text-text-40 mt-0.5">15 minutes ago • by Auto</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
