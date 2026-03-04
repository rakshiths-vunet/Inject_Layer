import React from "react";
import { Clock, Calendar, Repeat } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export interface ScheduleParameters {
    schedule_start_time: string | null;
    schedule_end_time: string | null;
    cron_expression: string | null;
    timeout_minutes: number | null;
}

interface ScenarioSchedulerControlsProps {
    isScheduled: boolean;
    setIsScheduled: (val: boolean) => void;
    scheduleParams: ScheduleParameters;
    setScheduleParams: (params: ScheduleParameters) => void;
}

export function ScenarioSchedulerControls({
    isScheduled,
    setIsScheduled,
    scheduleParams,
    setScheduleParams
}: ScenarioSchedulerControlsProps) {

    const handleChange = (field: keyof ScheduleParameters, value: string | number | null) => {
        setScheduleParams({
            ...scheduleParams,
            [field]: value === '' ? null : value
        });
    };

    return (
        <div className="bg-[#1C1F26] rounded-xl border border-text-100/10 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent-500" />
                    <h3 className="text-text-100 font-medium">Execution Schedule</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Label className="text-text-100/70 text-sm">Schedule Run</Label>
                    <Switch
                        checked={isScheduled}
                        onCheckedChange={setIsScheduled}
                        className="data-[state=checked]:bg-accent-500"
                    />
                </div>
            </div>

            {isScheduled && (
                <div className="pt-4 border-t border-text-100/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-text-100/70 flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Start Time
                            </Label>
                            <Input
                                type="datetime-local"
                                value={scheduleParams.schedule_start_time || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('schedule_start_time', e.target.value)}
                                className="bg-panel-700 border-text-100/10 text-text-100"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-text-100/70 flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Timeout (End Time)
                            </Label>
                            <Input
                                type="datetime-local"
                                value={scheduleParams.schedule_end_time || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('schedule_end_time', e.target.value)}
                                className="bg-panel-700 border-text-100/10 text-text-100"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-text-100/70 flex items-center gap-2">
                                <Clock className="w-3 h-3 text-accent-500" /> Timeout (Minutes)
                            </Label>
                            <Input
                                type="number"
                                placeholder="e.g. 60"
                                value={scheduleParams.timeout_minutes || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('timeout_minutes', e.target.value ? parseInt(e.target.value) : null)}
                                className="bg-panel-700 border-text-100/10 text-text-100"
                            />
                            <p className="text-[10px] text-text-100/40">Scenario will auto-deactivate after this duration.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-text-100/70 flex items-center gap-2">
                            <Repeat className="w-3 h-3" /> Recurring Schedule (Cron Format)
                        </Label>
                        <Input
                            placeholder="e.g. 0 2 * * * (Every day at 2am)"
                            value={scheduleParams.cron_expression || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('cron_expression', e.target.value)}
                            className="bg-panel-700 border-text-100/10 text-text-100 truncate font-mono text-sm"
                        />
                        <p className="text-xs text-text-100/40">
                            Leave blank for a one-time execution. If provided, the scenario will run repeatedly.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
