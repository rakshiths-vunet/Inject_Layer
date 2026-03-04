import React, { useState, useEffect } from "react";
import { X, HelpCircle } from "lucide-react";
import { InjectionLibrarySidebar } from "./InjectionLibrarySidebar";
import { ScenarioBuilderMain } from "./ScenarioBuilderMain";
import { ScenarioSummary } from "./ScenarioSummary";
import { ScenarioSchedulerControls, ScheduleParameters } from "./ScenarioSchedulerControls";
import { Input } from "./ui/input";
import { InjectionType } from "../../brum/injectionCategories";

interface CreateScenarioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    scenarioToEdit?: any; // If provided, modal opens in edit mode
}

export interface ScenarioInjection extends InjectionType {
    instanceId: string;
    config: Record<string, any>;
    isCollapsed?: boolean;
}


export function CreateScenarioModal({ isOpen, onClose, onSaveSuccess, scenarioToEdit }: CreateScenarioModalProps) {
    const [scenarioName, setScenarioName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedSites, setSelectedSites] = useState<string[]>([]);
    const [availableSites, setAvailableSites] = useState<{ label: string, value: string }[]>([]);
    const [injections, setInjections] = useState<ScenarioInjection[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    // States: IDLE, VALIDATING, DEPLOYING, SUCCESS, ERROR
    const [saveState, setSaveState] = useState<'IDLE' | 'VALIDATING' | 'DEPLOYING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [deployError, setDeployError] = useState<string | null>(null);

    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduleParams, setScheduleParams] = useState<ScheduleParameters>({
        schedule_start_time: null,
        schedule_end_time: null,
        cron_expression: null,
        timeout_minutes: null
    });

    useEffect(() => {
        if (isOpen) {
            fetch('/api/chaos/apps')
                .then(res => res.json())
                .then(data => {
                    if (data.ok && data.apps) {
                        const apps = data.apps.map((app: string) => ({
                            label: app.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                            value: app
                        }));
                        // Add some default location tags if needed
                        setAvailableSites([
                            { label: 'Global (All)', value: 'global' },
                            ...apps
                        ]);
                    }
                })
                .catch(err => console.error("Failed to fetch scenario sites", err));
        }
    }, [isOpen]);

    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    // Pre-populate if editing
    useEffect(() => {
        if (isOpen && scenarioToEdit) {
            setScenarioName(scenarioToEdit.name || '');
            setDescription(scenarioToEdit.description || '');
            setSelectedSites(scenarioToEdit.sites || []);
            setInjections(scenarioToEdit.injections || []);
            setIsDirty(false);
            setSaveState('IDLE');
            setValidationErrors([]);
            setDeployError(null);

            setIsScheduled(!!scenarioToEdit.schedule_start_time || !!scenarioToEdit.cron_expression);
            setScheduleParams({
                schedule_start_time: scenarioToEdit.schedule_start_time || null,
                schedule_end_time: scenarioToEdit.schedule_end_time || null,
                cron_expression: scenarioToEdit.cron_expression || null,
                timeout_minutes: scenarioToEdit.timeout_minutes || null
            });
        } else if (isOpen && !scenarioToEdit) {
            setScenarioName('');
            setDescription('');
            setSelectedSites([]);
            setInjections([]);
            setIsDirty(false);
            setSaveState('IDLE');
            setValidationErrors([]);
            setDeployError(null);
            setIsScheduled(false);
            setScheduleParams({
                schedule_start_time: null,
                schedule_end_time: null,
                cron_expression: null,
                timeout_minutes: null
            });
        }
    }, [isOpen, scenarioToEdit]);

    if (!isOpen) return null;

    const validateScenario = () => {
        const errors: string[] = [];
        if (!scenarioName.trim()) errors.push("Scenario Name is required.");
        if (injections.length === 0) errors.push("Please add at least one injection.");

        injections.forEach((inj) => {
            if (inj.config.enabled === false) return; // skip disabled

            if (inj.id === 'fixed-delay' && (!inj.config.delay || inj.config.delay <= 0)) {
                errors.push(`'Fixed Delay' requires delay > 0`);
            }
            if (inj.id === 'uniform-random') {
                if (!inj.config.min_delay || !inj.config.max_delay || inj.config.min_delay >= inj.config.max_delay) {
                    errors.push(`'Uniform Random' requires min_delay < max_delay`);
                }
            }
            if (inj.config.target_type === 'api' && (!inj.config.api_endpoints?.length) && !inj.config.restricted_sites?.includes('global') && !selectedSites.includes('global')) {
                if (!inj.config.api_endpoints?.length) {
                    errors.push(`API target in '${inj.title}' requires at least one endpoint.`);
                }
            }
            if (inj.id.includes('status') && (inj.config.status_code < 100 || inj.config.status_code > 599)) {
                errors.push(`Valid HTTP Status code (100-599) required in '${inj.title}'.`);
            }
            if (inj.id === 'stateful-rate-limit' && (!inj.config.limit || inj.config.limit <= 0 || !inj.config.window_s || inj.config.window_s <= 0)) {
                errors.push(`Stateful Rate Limit requires limit > 0 and window > 0 in '${inj.title}'.`);
            }
            if (inj.id === 'wrong-redirect' && !inj.config.target?.trim()) {
                errors.push(`Wrong Redirect requires target URI in '${inj.title}'.`);
            }
            if (inj.id === 'replace-field-value' && (!inj.config.field?.trim() || !inj.config.value?.trim())) {
                errors.push(`Replace Field Value requires both Field and Value in '${inj.title}'.`);
            }
        });

        return errors;
    };

    const handleSave = async (userAction: 'activate' | 'draft') => {
        setSaveState('VALIDATING');
        const errors = validateScenario();
        if (errors.length > 0) {
            setValidationErrors(errors);
            setSaveState('IDLE');
            return;
        }

        setValidationErrors([]);
        setSaveState('DEPLOYING');
        setDeployError(null);

        const action = userAction === 'activate' && isScheduled ? 'scheduled' : userAction;

        const payload = {
            name: scenarioName,
            description,
            sites: selectedSites,
            injections,
            action,
            ...(isScheduled ? scheduleParams : { schedule_start_time: null, schedule_end_time: null, cron_expression: null, timeout_minutes: null })
        };

        try {
            const url = scenarioToEdit ? `/api/scenarios/${scenarioToEdit.id}` : `/api/scenarios`;
            const method = scenarioToEdit ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errData = await res.json();
                setDeployError(errData.error || errData.detail || 'Failed to save/deploy rules');
                setSaveState('ERROR');
                return;
            }

            setSaveState('SUCCESS');
            setTimeout(() => {
                onSaveSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            setDeployError(err.message || 'Network error');
            setSaveState('ERROR');
        }
    };

    const handleClose = () => {
        if (isDirty || injections.length > 0) {
            if (!window.confirm("You have unsaved changes. Are you sure you want to discard this scenario?")) {
                return;
            }
        }
        onClose();
    };

    const handleAddInjection = (type: InjectionType) => {
        const newInjection: ScenarioInjection = {
            ...type,
            instanceId: `${type.id} - ${Date.now()}`,
            config: type.fields.reduce((acc, field) => {
                if (field.defaultValue !== undefined) {
                    acc[field.id] = field.defaultValue;
                }
                return acc;
            }, {} as Record<string, any>),
        };
        setInjections((prev) => [...prev, newInjection]);
        setIsDirty(true);

        // Scroll to bottom of main content where new card is added
        setTimeout(() => {
            const scrollContainer = document.getElementById("scenario-builder-main");
            if (scrollContainer) {
                scrollContainer.scrollTo({ top: scrollContainer.scrollHeight, behavior: "smooth" });
            }
        }, 100);
    };

    const handleRemoveInjection = (instanceId: string) => {
        setInjections((prev) => prev.filter((inj) => inj.instanceId !== instanceId));
        setIsDirty(true);
    };

    const handleDuplicateInjection = (injection: ScenarioInjection) => {
        const duplicated: ScenarioInjection = {
            ...injection,
            instanceId: `${injection.id} - ${Date.now()}`,
        };
        setInjections((prev) => {
            const idx = prev.findIndex(i => i.instanceId === injection.instanceId);
            const newInjections = [...prev];
            newInjections.splice(idx + 1, 0, duplicated);
            return newInjections;
        });
        setIsDirty(true);
    };

    const handleUpdateInjection = (instanceId: string, updates: Partial<ScenarioInjection>) => {
        setInjections((prev) =>
            prev.map((inj) =>
                inj.instanceId === instanceId ? { ...inj, ...updates } : inj
            )
        );
        setIsDirty(true);
    };

    const moveInjection = (dragIndex: number, hoverIndex: number) => {
        const draggedItem = injections[dragIndex];
        if (!draggedItem) return;
        setInjections(prev => {
            const newInjections = [...prev];
            newInjections.splice(dragIndex, 1);
            newInjections.splice(hoverIndex, 0, draggedItem);
            return newInjections;
        });
        setIsDirty(true);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-900/60 backdrop-blur-sm p-4">
            <div
                className="flex flex-col w-full max-w-[1200px] max-h-[95vh] h-full bg-bg-900 border border-text-100/10 rounded-2xl shadow-2xl relative overflow-hidden"
                style={{ fontFamily: 'var(--font-family)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}
            >
                {/* STICKY HEADER */}
                <div className="flex-none bg-panel-700 border-b border-text-100/10 p-6 z-20">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-text-100 flex items-center gap-2">
                            Create New Scenario
                        </h2>
                        <div className="flex items-center gap-4">
                            <button className="text-text-100/40 hover:text-text-100 flex items-center gap-1.5 text-sm transition-colors">
                                <HelpCircle className="w-4 h-4" /> Help
                            </button>
                            <button
                                onClick={handleClose}
                                className="p-1.5 text-text-100/40 hover:text-text-100 hover:bg-text-100/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {validationErrors.length > 0 && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4 text-sm mt-4">
                            <strong>Fix the following {validationErrors.length} issues before saving:</strong>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
                            </ul>
                        </div>
                    )}
                    {deployError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg mb-4 text-sm mt-4">
                            <strong>Deployment Error:</strong> {deployError}
                            <div className="mt-3 flex gap-3">
                                <button onClick={() => handleSave('activate')} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded text-red-300 font-medium transition">Retry Failure</button>
                                <button onClick={() => handleSave('draft')} className="px-3 py-1.5 bg-text-100/5 hover:bg-text-100/10 rounded text-text-100/70 font-medium transition">Keep as Draft</button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                        <label className="text-sm font-medium text-text-100/70 text-right">Scenario Name:</label>
                        <Input
                            value={scenarioName}
                            onChange={(e) => { setScenarioName(e.target.value); setIsDirty(true); }}
                            placeholder="e.g. Black Friday DB Failover"
                            className="bg-panel-800 border-text-100/10 text-text-100 text-lg font-semibold h-12"
                            autoFocus
                        />

                        <label className="text-sm font-medium text-text-100/70 text-right">Description:</label>
                        <Input
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
                            placeholder="What are you testing?"
                            className="bg-panel-800 border-text-100/10 text-text-100/80 h-10"
                        />

                        <label className="text-sm font-medium text-text-100/70 text-right pt-1">Source App / Location Tag:</label>
                        <div className="w-full">
                            {availableSites.length === 0 ? (
                                <div className="text-text-100/30 text-sm italic py-1">Loading apps…</div>
                            ) : (
                                <div className="flex flex-wrap gap-2 py-1">
                                    {availableSites.map((site) => {
                                        const isSelected = selectedSites.includes(site.value);
                                        return (
                                            <label
                                                key={site.value}
                                                className="flex items-center gap-2 cursor-pointer select-none"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="sr-only"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        const next = isSelected
                                                            ? selectedSites.filter((s) => s !== site.value)
                                                            : [...selectedSites, site.value];
                                                        setSelectedSites(next);
                                                        setIsDirty(true);
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '4px 10px',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: 500,
                                                        border: isSelected ? '1px solid #FFC857' : '1px solid rgba(255,255,255,0.12)',
                                                        background: isSelected ? 'rgba(255,200,87,0.12)' : 'rgba(255,255,255,0.04)',
                                                        color: isSelected ? '#FFC857' : 'rgba(255,255,255,0.6)',
                                                        transition: 'all 0.15s',
                                                    }}
                                                >
                                                    <svg
                                                        width="12" height="12" viewBox="0 0 12 12"
                                                        fill="none"
                                                        style={{ flexShrink: 0 }}
                                                    >
                                                        <rect
                                                            x="0.5" y="0.5" width="11" height="11" rx="2.5"
                                                            fill={isSelected ? '#FFC857' : 'transparent'}
                                                            stroke={isSelected ? '#FFC857' : 'rgba(255,255,255,0.3)'}
                                                        />
                                                        {isSelected && (
                                                            <path
                                                                d="M3 6l2 2 4-4"
                                                                stroke="currentColor"
                                                                strokeWidth="1.5"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            />
                                                        )}
                                                    </svg>
                                                    {site.label}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                            {selectedSites.length > 0 && (
                                <div className="mt-1.5 text-xs text-text-100/30">
                                    {selectedSites.length} selected
                                </div>
                            )}
                        </div>

                        {/* Scheduler Controls */}
                        <div className="col-span-2 mt-4 transition-all pr-2 max-w-full">
                            <ScenarioSchedulerControls
                                isScheduled={isScheduled}
                                setIsScheduled={setIsScheduled}
                                scheduleParams={scheduleParams}
                                setScheduleParams={setScheduleParams}
                            />
                        </div>
                    </div>
                </div>

                {/* CONTENT ROW */}
                <div className="flex-1 min-h-0 flex flex-col md:flex-row relative">

                    {/* LEFT SIDEBAR - Injection Palette */}
                    <div className="w-full md:w-[320px] flex-none border-r border-text-100/10 bg-panel-800 overflow-y-auto stylish-scrollbar flex flex-col">
                        <div className="flex-1">
                            <InjectionLibrarySidebar
                                onAddInjection={handleAddInjection}
                            />
                        </div>
                        {/* Summary embedded at bottom of sidebar */}
                        <div className="p-4 border-t border-text-100/10 sticky bottom-0 bg-bg-900 backdrop-blur">
                            <ScenarioSummary injections={injections} sites={selectedSites} />
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA - Builder */}
                    <div
                        id="scenario-builder-main"
                        className="flex-1 bg-bg-900 overflow-y-auto stylish-scrollbar p-6 relative"
                    >
                        <ScenarioBuilderMain
                            injections={injections}
                            onRemove={handleRemoveInjection}
                            onDuplicate={handleDuplicateInjection}
                            onUpdate={handleUpdateInjection}
                            moveInjection={moveInjection}
                            globalSites={selectedSites}
                        />
                    </div>

                </div>

                {/* STICKY FOOTER */}
                <div className="flex-none bg-panel-700 border-t border-text-100/10 p-4 px-6 flex items-center justify-between z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-text-100/70 hover:text-text-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleSave('draft')}
                            disabled={saveState === 'DEPLOYING'}
                            className="px-4 py-2 text-sm font-medium text-text-100/70 hover:text-text-100 transition-colors disabled:opacity-50"
                        >
                            Save as Draft
                        </button>
                    </div>

                    <button
                        disabled={saveState === 'DEPLOYING' || saveState === 'SUCCESS'}
                        onClick={() => handleSave('activate')}
                        className="px-6 py-2.5 bg-accent-500 hover:bg-accent-400 text-bg-900 font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saveState === 'SUCCESS' ? '✅ Success' : saveState === 'DEPLOYING' ? 'Deploying...' : isScheduled ? '⏳ Schedule Scenario' : scenarioToEdit ? '▶ Update & Re-activate' : '▶ Save & Activate Scenario'}
                    </button>
                </div>
            </div>
        </div>
    );
}
