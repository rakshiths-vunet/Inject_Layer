import { X, Save, ChevronRight, Info, Check, ChevronsUpDown, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { cn } from "./ui/utils"
import { MultiSelect } from './ui/MultiSelect';
import { DynamicList } from './ui/DynamicList';
import { INJECTION_CATEGORIES, InjectionField } from '../../brum/injectionCategories';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface RuleBuilderPanelProps {
  categoryId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RuleBuilderPanel({
  categoryId,
  isOpen,
  onClose,
}: RuleBuilderPanelProps) {
  const category = INJECTION_CATEGORIES.find(c => c.id === categoryId);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // Reset state when category changes or panel opens
  useEffect(() => {
    if (isOpen && category) {
      if (category.types.length > 0) {
        setSelectedTypeId(category.types[0].id);
      }
      setFormValues({});
    }
  }, [isOpen, category]);

  // Reset form values when selected type changes
  useEffect(() => {
    if (selectedTypeId && category) {
      const type = category.types.find(t => t.id === selectedTypeId);
      if (type) {
        const initialValues: Record<string, any> = {};
        type.fields.forEach(field => {
          if (field.defaultValue !== undefined) {
            initialValues[field.id] = field.defaultValue;
          }
        });
        setFormValues(initialValues);
      }
    }
  }, [selectedTypeId, category]);

  if (!isOpen || !category) return null;

  const selectedType = category.types.find(t => t.id === selectedTypeId);

  const handleFieldChange = (id: string, value: any) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const renderField = (field: InjectionField) => {
    switch (field.type) {
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-white/90 flex justify-between">
              {field.label}
              {field.unit && <span className="text-white/40 font-mono text-xs">{field.unit}</span>}
            </label>
            <Input
              type="number"
              value={formValues[field.id] ?? ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={field.placeholder || (field.defaultValue !== undefined ? String(field.defaultValue) : '')}
              min={field.min}
              max={field.max}
              step={field.step}
              className="bg-[#14161A] border-white/10 text-white"
            />
          </div>
        );
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-white/90">{field.label}</label>
            <Input
              type="text"
              value={formValues[field.id] ?? ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || (field.defaultValue as string)}
              className="bg-[#14161A] border-white/10 text-white"
            />
          </div>
        );
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-white/90">{field.label}</label>
            <Textarea
              value={formValues[field.id] ?? ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="bg-[#14161A] border-white/10 text-white min-h-[100px]"
            />
          </div>
        );
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-white/90">{field.label}</label>
            <Select
              value={formValues[field.id] ?? field.defaultValue}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              <SelectTrigger className="w-full bg-[#14161A] border-white/10 text-white">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'slider':
        return (
          <div key={field.id} className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-white/90">{field.label}</label>
              <span className="text-xs font-mono text-[#FFC857]">
                {formValues[field.id] ?? field.defaultValue ?? 0}{field.unit}
              </span>
            </div>
            <Slider
              value={[formValues[field.id] ?? field.defaultValue ?? 0]}
              onValueChange={(val) => handleFieldChange(field.id, val[0])}
              min={field.min ?? 0}
              max={field.max ?? 100}
              step={field.step ?? 1}
              className="py-2"
            />
          </div>
        );
      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center gap-3 p-4 rounded-lg bg-[#14161A] border border-white/5">
            <Checkbox
              checked={formValues[field.id] ?? field.defaultValue ?? false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <label className="text-sm font-medium text-white/90 cursor-pointer" onClick={() => handleFieldChange(field.id, !formValues[field.id])}>
              {field.label}
            </label>
          </div>
        );
      case 'multiselect':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-white/90">{field.label}</label>
            <MultiSelect
              options={field.options || []}
              selected={formValues[field.id] || []}
              onChange={(val) => handleFieldChange(field.id, val)}
              placeholder={field.placeholder}
            />
          </div>
        );
      case 'dynamic_list':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-white/90">{field.label}</label>
            <DynamicList
              items={formValues[field.id] || []}
              onChange={(val) => handleFieldChange(field.id, val)}
              placeholder={field.placeholder}
              options={field.options}
            />
          </div>
        );
      case 'info':
        return (
          <Alert key={field.id} variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500">
            <Info className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              {field.defaultValue}
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  const getVisibleFields = () => {
    if (!selectedType) return [];
    return selectedType.fields.filter(field => {
      if (!field.condition) return true;
      const { field: depField, value: depValue } = field.condition;
      return formValues[depField] === depValue;
    });
  };

  // Construct JSON Payload
  const constructPayload = () => {
    if (!selectedType) return {};

    // Basic structure
    const payload: any = {
      id: `${selectedType.id}-${Date.now()}`, // Generate a unique ID or let user input? Requirement says "id: String Unique slug". We can auto-generate for now.
      name: formValues.name || selectedType.title,
      enabled: true,
      phase: "access",
      probability: formValues.probability ?? 100,
      group: category.id === 'network-tcp' ? 'network' : undefined,
      action: "latency", // Default for latency category, logic can be improved
      selectors: {},
      action_params: {},
    };

    // Add location_tag to selectors if it's not 'global'
    if (formValues.location_tag && formValues.location_tag !== 'global') {
      payload.selectors.location_tag = formValues.location_tag;
    }

    // Generic Selector Handling (works for latency, network-tcp, http-status, cors-csp, and routing)
    if (category.id === 'latency' || category.id === 'network-tcp' || category.id === 'http-status' || category.id === 'cors-csp' || category.id === 'routing') {
      if (formValues.target_type === 'assets') {
        const assets = formValues.assets_selected || [];
        if (assets.length > 0) {
          // specific assets - exact match at end of URI
          const regex = assets.map((a: string) => a.replace('.', '\\.')).join('|') + '$';
          payload.selectors.uri_regex = regex;
        }
      } else if (formValues.target_type === 'api') {
        const methods = formValues.methods;
        if (methods && methods.length > 0) {
          payload.selectors.method = methods;
        }

        const endpoints = formValues.api_endpoints || [];
        if (endpoints.length > 0) {
          const regex = endpoints.map((e: string) => e).join('|');
          payload.selectors.uri_regex = regex;
        }
      } else if (formValues.target_type === 'regex') {
        if (formValues.custom_regex) {
          payload.selectors.uri_regex = formValues.custom_regex;
        }
      } else if (formValues.target_type === 'extension') {
        if (formValues.extension) {
          payload.selectors.file_type = formValues.extension;
        }
      }
    }

    // Handle Action Params & Specific Action Names
    if (category.id === 'latency') {
      payload.action = 'latency';
      if (selectedType.id === 'fixed-delay') {
        payload.action_params = {
          model: 'fixed',
          delay_ms: Number(formValues.delay),
          max_cap_ms: Number(formValues.max_cap) || undefined
        };
      } else if (selectedType.id === 'uniform-random') {
        payload.action_params = {
          model: 'uniform',
          min_ms: Number(formValues.min_delay),
          max_ms: Number(formValues.max_delay),
          max_cap_ms: Number(formValues.max_cap) || undefined
        };
      }
    } else if (category.id === 'network-tcp') {
      // Map action names
      if (selectedType.id === 'tcp-reset') {
        payload.action = 'tcp_reset';
      } else if (selectedType.id === 'connection-hang') {
        payload.action = 'hang';
        payload.action_params = {
          duration_s: Number(formValues.duration) || 30
        };
      } else if (selectedType.id === 'upstream-fail') {
        payload.action = 'status';
        payload.action_params = {
          status_code: 502 // Default or add field?
        };
      } else if (selectedType.id === 'chunked-truncation') {
        payload.action = 'truncate_body';
        payload.phase = 'body_filter';
        payload.action_params = {
          at_bytes: Number(formValues.at_bytes) || 50
        };
      }
    } else if (category.id === 'http-status') {
      payload.group = 'http-errors';
      if (selectedType.id === 'static-status' || selectedType.id === 'random-status') {
        payload.action = 'http_status';
        payload.action_params = {
          status: Number(formValues.status_code || 500),
          body: formValues.body,
          retry_after: formValues.retry_after ? Number(formValues.retry_after) : undefined
        };
      } else if (selectedType.id === 'rate-limit-stateless') {
        payload.action = 'rate_limit_429';
        payload.action_params = {
          limit: Number(formValues.limit),
          retry_after: Number(formValues.retry_after)
        };
      } else if (selectedType.id === 'rate-limit-stateful') {
        payload.action = 'stateful_rate_limit';
        payload.action_params = {
          limit: Number(formValues.limit),
          window_s: Number(formValues.window_s),
          retry_after: Number(formValues.retry_after)
        };
      }
    } else if (category.id === 'frontend-asset') {
      payload.group = 'assets';
      if (selectedType.id === 'asset-wrong-mime-js' || selectedType.id === 'asset-wrong-mime-css') {
        payload.action = 'wrong_mime';
        payload.phase = 'header_filter';
        payload.action_params = {
          mime: formValues.mime || 'text/plain'
        };
        payload.selectors = {
          file_type: selectedType.id === 'asset-wrong-mime-js' ? '.js' : '.css'
        };
      }
    } else if (category.id === 'cors-csp') {
      payload.group = 'cors-csp';
      if (selectedType.id === 'cors-remove-all-api' || selectedType.id === 'remove-cors') {
        payload.action = 'remove_cors';
        payload.phase = 'header_filter';
      } else if (selectedType.id === 'csp-injection') {
        payload.action = 'wrong_csp';
        payload.phase = 'header_filter';

        let policy = "";
        switch (formValues.policy_preset) {
          case 'everything':
            policy = "default-src 'none'; script-src 'none'; style-src 'none'; img-src 'none'; connect-src 'none'";
            break;
          case 'apis':
            policy = "connect-src 'none';";
            break;
          case 'images':
            policy = "img-src 'none';";
            break;
          case 'fonts':
            policy = "font-src 'none';";
            break;
          case 'custom':
            policy = formValues.custom_policy || "";
            break;
        }
        payload.action_params = { policy };
      }
    } else if (category.id === 'routing') {
      payload.group = 'routing';
      if (selectedType.id === 'redirect-loop') {
        payload.action = 'redirect_loop';
        payload.phase = 'access';
      }
    }

    return payload;
  };

  const handleDeploy = async () => {
    const payload = constructPayload();
    console.log('Deploying payload:', payload);

    try {
      // Check if there are existing rules with the same selector
      const rulesResponse = await fetch('/api/chaos/rules');
      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();
        // Ultra-robust check: handle array, object with rules array, or fallback to empty array
        const rawRules = Array.isArray(rulesData) ? rulesData : (rulesData && typeof rulesData === 'object' ? rulesData.rules : []);
        const existingRules = Array.isArray(rawRules) ? rawRules : [];

        // Check if any existing rule has the same selector
        const hasDuplicateSelector = existingRules.some((rule: any) => {
          if (!rule.selectors || !payload.selectors) return false;

          // Check if uri_regex matches
          if (rule.selectors.uri_regex && payload.selectors.uri_regex) {
            return rule.selectors.uri_regex === payload.selectors.uri_regex;
          }

          return false;
        });

        // If duplicate selector found, we need to add continue_on_match to existing rules
        if (hasDuplicateSelector) {
          console.log('Duplicate selector detected, updating existing rules with continue_on_match');

          // Find all rules with the same selector and update them
          for (const rule of existingRules) {
            if (rule.selectors?.uri_regex === payload.selectors?.uri_regex && !rule.continue_on_match) {
              const updatedRule = { ...rule, continue_on_match: true };
              await fetch(`http://10.1.92.251:8080/__chaos/rules/${rule.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedRule)
              });
            }
          }
        }
      }

      const deployUrl = `http://10.1.92.251:8080/__chaos/rules/${payload.id}`;
      console.log(`[Deployment] Request: PUT ${deployUrl}`, payload);

      const res = await fetch(deployUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log(`[Deployment] Response Status: ${res.status} ${res.statusText}`);

      if (res.ok) {
        const responseData = await res.json().catch(() => ({}));
        console.log('[Deployment] Response Body:', responseData);
        alert('Rule deployed successfully!');
        // Log activity
        fetch('/api/activity', {
          method: 'POST',
          body: JSON.stringify({
            action: 'Deployed Rule',
            details: `${payload.name} (${payload.id})`
          })
        });
        onClose();
      } else {
        const err = await res.text();
        alert(`Failed to deploy: ${err}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to deploy rule. Check console.');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={onClose}
            />

            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%", transition: { type: "spring", damping: 30, stiffness: 200 } }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[500px] z-50 flex flex-col"
              style={{
                backgroundColor: "#0F1114",
                borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                        {category.icon && <category.icon className="w-5 h-5" style={{ color: category.iconColor }} />}
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        {category.title}
                      </h2>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors text-white/70 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Rule Name Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 uppercase tracking-wider text-xs">Rule Name (Optional)</label>
                    <Input
                      type="text"
                      value={formValues.name ?? ''}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder={selectedType?.title || "Enter a custom name"}
                      className="bg-[#1A1D24] border-white/10 text-white h-12"
                    />
                  </div>

                  {/* Location Tag Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 uppercase tracking-wider text-xs">Target Location (location_tag)</label>
                    <Select
                      value={formValues.location_tag ?? 'global'}
                      onValueChange={(val) => handleFieldChange('location_tag', val)}
                    >
                      <SelectTrigger className="w-full bg-[#1A1D24] border-white/10 text-white h-12">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="frontend_vue">Vue</SelectItem>
                        <SelectItem value="frontend_angular">Angular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Injection Type Selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70 uppercase tracking-wider text-xs">Injection Type</label>
                    <Select
                      value={selectedTypeId}
                      onValueChange={setSelectedTypeId}
                    >
                      <SelectTrigger className="w-full bg-[#1A1D24] border-white/10 text-white h-12">
                        <SelectValue placeholder="Select injection type" />
                      </SelectTrigger>
                      <SelectContent>
                        {category.types.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedType && (
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-500/10 border border-accent-500/20 text-sm text-accent-200 mt-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{selectedType.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Form Fields */}
                  {selectedType && (
                    <div className="space-y-6 pt-4 border-t border-white/10">
                      {getVisibleFields().map(field => renderField(field))}
                    </div>
                  )}

                  {/* JSON Preview */}
                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <label className="text-sm font-medium text-white/50 uppercase tracking-wider text-xs">JSON Preview</label>
                    <pre className="bg-[#14161A] p-4 rounded-lg border border-white/5 text-xs text-white/70 overflow-x-auto">
                      {JSON.stringify(constructPayload(), null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-white/10 bg-[#0F1114]">
                <button
                  className="w-full py-4 rounded-xl font-bold text-lg bg-[#FFC857] text-[#0B0C0F] hover:bg-[#FFD470] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#FFC857]/10"
                  onClick={handleDeploy}
                >
                  <Save className="w-5 h-5" />
                  Deploy Rule
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
