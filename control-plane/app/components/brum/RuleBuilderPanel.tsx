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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Command,
  CommandEmpty,
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
import { MultiSelect, Option } from './ui/MultiSelect';
import { DynamicList } from './ui/DynamicList';
import { INJECTION_CATEGORIES, InjectionField, API_TEMPLATES, HTTP_METHODS } from '../../brum/injectionCategories';
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Copy, Terminal } from 'lucide-react';




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
  const [formValues, setFormValues] = useState<Record<string, any>>({
    method: HTTP_METHODS // Default all methods for API flow
  });
  const [apiEndpointMode, setApiEndpointMode] = useState<'template' | 'custom'>('template');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const [sourceAppsList, setSourceAppsList] = useState<{ label: string, value: string }[]>([]);
  const [assetsList, setAssetsList] = useState<Option[]>([]);

  useEffect(() => {
    fetch('/api/chaos/apps')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.apps) {
          setSourceAppsList(data.apps.map((app: string) => ({
            label: app.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            value: app
          })));
        }
      })
      .catch(err => console.error("Failed to fetch apps", err));
  }, []);

  useEffect(() => {
    if (formValues.target_type !== 'assets') return;

    const selectedApps = Buffer.isBuffer(formValues.source_app) ? [] : (Array.isArray(formValues.source_app) ? formValues.source_app : (formValues.source_app ? [formValues.source_app] : []));

    if (selectedApps.length === 0) {
      setAssetsList([]);
      return;
    }

    const fetchAssets = async () => {
      try {
        const allAssets: Option[] = [];
        const seenValues = new Set<string>();

        const appColors: Record<string, string> = {
          'angular-v1': '#DD0031',
          'angular-v2': '#C3002F',
          'vue-v1': '#41B883',
          'vue-v2': '#35495E',
          'react-v1': '#61DAFB',
          'react-v2': '#282C34',
          'next-v1': '#000000',
          'next-v2': '#555555',
          'nuxt-v1': '#00C58E',
          'nuxt-v2': '#2F495E',
        };

        const getTypeColor = (asset: string) => {
          if (asset.endsWith('.js')) return '#B5A642'; // Darker yellowish
          if (asset.endsWith('.css')) return '#264DE4';
          if (asset.match(/\.(png|jpg|jpeg|svg|gif|ico)$/i)) return '#9C27B0';
          return '#888888';
        };

        const getTypeTag = (asset: string) => {
          if (asset.endsWith('.js')) return 'JS';
          if (asset.endsWith('.css')) return 'CSS';
          if (asset.match(/\.(png|jpg|jpeg|svg|gif|ico)$/i)) return 'Img';
          return 'File';
        };

        for (const app of selectedApps) {
          const res = await fetch(`/api/chaos/assets?app=${app}`);
          const data = await res.json();
          if (data.ok && data.assets) {
            data.assets.forEach((asset: string) => {
              const val = asset;
              if (!seenValues.has(val)) {
                seenValues.add(val);
                allAssets.push({
                  label: asset,
                  value: val,
                  tag: app,
                  tagColor: appColors[app] || '#666666',
                  typeTag: getTypeTag(asset),
                  typeColor: getTypeColor(asset)
                });
              }
            });
          }
        }
        setAssetsList(allAssets);
      } catch (err) {
        console.error("Failed to fetch assets", err);
      }
    };

    fetchAssets();
  }, [formValues.source_app, formValues.target_type]);

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
  const locationTag = formValues.location_tag ?? 'global';

  const getModifiedOptions = (options?: { label: string; value: string }[]) => {
    if (!options) return [];
    if (!locationTag.endsWith('_v2')) return options;

    return options.map(opt => {
      const isGateway = opt.value.startsWith('gateway/') || opt.label.startsWith('gateway/');
      if (isGateway) {
        return {
          ...opt,
          label: opt.label.replace(/^gateway\//, 'gateway-v2/'),
          value: opt.value.replace(/^gateway\//, 'gateway-v2/')
        };
      }
      return opt;
    });
  };

  const handleFieldChange = (id: string, value: any) => {
    setFormValues(prev => ({ ...prev, [id]: value }));
  };

  const renderField = (field: InjectionField) => {
    switch (field.type) {
      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-text-100/90 flex justify-between">
              {field.label}
              {field.unit && <span className="text-text-100/40 font-mono text-xs">{field.unit}</span>}
            </label>
            <Input
              type="number"
              value={formValues[field.id] ?? ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={field.placeholder || (field.defaultValue !== undefined ? String(field.defaultValue) : '')}
              min={field.min}
              max={field.max}
              step={field.step}
              className="bg-panel-700 border-text-100/10 text-text-100"
            />
          </div>
        );
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-text-100/90">{field.label}</label>
            <Input
              type="text"
              value={formValues[field.id] ?? ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || (field.defaultValue as string)}
              className="bg-panel-700 border-text-100/10 text-text-100"
            />
          </div>
        );
      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-text-100/90">{field.label}</label>
            <Textarea
              value={formValues[field.id] ?? ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className="bg-panel-700 border-text-100/10 text-text-100 min-h-[100px]"
            />
          </div>
        );
      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-text-100/90">{field.label}</label>
            <Select
              value={formValues[field.id] ?? field.defaultValue}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              <SelectTrigger className="w-full bg-panel-700 border-text-100/10 text-text-100">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                {getModifiedOptions(field.options)?.map((opt) => (
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
              <label className="text-sm font-medium text-text-100/90">{field.label}</label>
              <span className="text-xs font-mono text-accent-500">
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
          <div key={field.id} className="flex items-center gap-3 p-4 rounded-lg bg-panel-700 border border-text-100/5">
            <Checkbox
              checked={formValues[field.id] ?? field.defaultValue ?? false}
              onCheckedChange={(checked) => handleFieldChange(field.id, checked)}
            />
            <label className="text-sm font-medium text-text-100/90 cursor-pointer" onClick={() => handleFieldChange(field.id, !formValues[field.id])}>
              {field.label}
            </label>
          </div>
        );
      case 'multiselect':
        const multiselectOptions = field.id === 'assets_selected' ? assetsList : (getModifiedOptions(field.options) || []);
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-text-100/90">{field.label}</label>
            <MultiSelect
              options={multiselectOptions}
              selected={formValues[field.id] || []}
              onChange={(val) => handleFieldChange(field.id, val)}
              placeholder={field.placeholder}
            />
          </div>
        );
      case 'dynamic_list':
        return (
          <div key={field.id} className="space-y-2">
            <label className="text-sm font-medium text-text-100/90">{field.label}</label>
            <DynamicList
              items={formValues[field.id] || []}
              onChange={(val) => handleFieldChange(field.id, val)}
              placeholder={field.placeholder}
              options={getModifiedOptions(field.options)}
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

  const renderSourceAppGrid = () => {
    const selectedApps = Buffer.isBuffer(formValues.source_app) ? [] : (Array.isArray(formValues.source_app) ? formValues.source_app : (formValues.source_app ? [formValues.source_app] : []));

    const toggleApp = (apps: string[]) => {
      if (apps.length === 0) {
        const { source_app, ...rest } = formValues;
        setFormValues(rest);
      } else if (apps.length === 1) {
        setFormValues(prev => ({ ...prev, source_app: apps[0] }));
      } else {
        setFormValues(prev => ({ ...prev, source_app: apps }));
      }
    };

    return (
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-text-100/70 uppercase tracking-wider text-xs">Source App (Optional)</label>
          <p className="text-[10px] text-text-100/40 mt-1 italic">Inject only when the API call originates from these frontends. Leave empty to affect all apps.</p>
        </div>
        <MultiSelect
          options={sourceAppsList}
          selected={selectedApps}
          onChange={toggleApp}
          placeholder="Select source apps..."
        />
      </div>
    );
  };

  const renderApiEndpointSelector = () => {
    return (
      <div className="space-y-4">
        <label className="text-sm font-medium text-text-100/70 uppercase tracking-wider text-xs">API Endpoint</label>

        <div className="flex bg-panel-700 p-1 rounded-lg border border-text-100/5">
          <button
            className={cn(
              "flex-1 py-2 text-xs font-medium rounded-md transition-all",
              apiEndpointMode === 'template' ? "bg-text-100/10 text-text-100 shadow-lg" : "text-text-100/40 hover:text-text-100/60"
            )}
            onClick={() => setApiEndpointMode('template')}
          >
            From Template
          </button>
          <button
            className={cn(
              "flex-1 py-2 text-xs font-medium rounded-md transition-all",
              apiEndpointMode === 'custom' ? "bg-text-100/10 text-text-100 shadow-lg" : "text-text-100/40 hover:text-text-100/60"
            )}
            onClick={() => setApiEndpointMode('custom')}
          >
            Custom URI
          </button>
        </div>

        {apiEndpointMode === 'template' ? (
          <div className="space-y-2">
            <Select
              onValueChange={(val) => {
                const escapedVal = val.replace(/\//g, '\\/');
                handleFieldChange('uri_regex', escapedVal);
                if (validationErrors.uri_regex) {
                  setValidationErrors(prev => {
                    const next = { ...prev };
                    delete next.uri_regex;
                    return next;
                  });
                }
              }}
            >
              <SelectTrigger className="w-full bg-panel-700 border-text-100/10 text-text-100 h-12">
                <SelectValue placeholder="Select API pattern..." />
              </SelectTrigger>
              <SelectContent className="bg-panel-600 border-text-100/10 max-h-[300px]">
                {Object.entries(API_TEMPLATES).map(([category, items]) => (
                  <SelectGroup key={category}>
                    <SelectLabel className="text-text-100/40 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                      {category}
                    </SelectLabel>
                    {items.map(item => (
                      <SelectItem key={item} value={item} className="text-text-100 hover:bg-text-100/5">
                        {item}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="space-y-2">
          <label className="text-xs font-medium text-text-100/40">URI Regex (PCRE)</label>
          <Input
            type="text"
            value={formValues.uri_regex ?? ''}
            onChange={(e) => {
              handleFieldChange('uri_regex', e.target.value);
              if (e.target.value.trim() && validationErrors.uri_regex) {
                setValidationErrors(prev => {
                  const next = { ...prev };
                  delete next.uri_regex;
                  return next;
                });
              }
            }}
            placeholder="e.g. gateway\/auth\/login"
            className={cn(
              "bg-panel-700 border-text-100/10 text-text-100",
              validationErrors.uri_regex && "border-red-500/50"
            )}
          />
          {validationErrors.uri_regex ? (
            <p className="text-[10px] text-red-400 mt-1">{validationErrors.uri_regex}</p>
          ) : (
            <p className="text-[10px] text-text-100/30 italic">Matched against the request URI using PCRE. Special characters like / must be escaped as \/.</p>
          )}
        </div>
      </div>
    );
  };

  const renderHttpMethodToggles = () => {
    const selectedMethods = formValues.method || [];

    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-100/70 uppercase tracking-wider text-xs">HTTP Methods</label>
        <div className="flex flex-wrap gap-2">
          {HTTP_METHODS.map(method => {
            const isSelected = selectedMethods.includes(method);
            return (
              <button
                key={method}
                onClick={() => {
                  const next = isSelected
                    ? selectedMethods.filter((m: string) => m !== method)
                    : [...selectedMethods, method];
                  handleFieldChange('method', next);
                  if (next.length > 0 && validationErrors.method) {
                    setValidationErrors(prev => {
                      const nextErr = { ...prev };
                      delete nextErr.method;
                      return nextErr;
                    });
                  }
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                  isSelected
                    ? "bg-accent-500 border-accent-500 text-bg-900"
                    : "bg-transparent border-text-100/10 text-text-100/40 hover:text-text-100/60 hover:border-text-100/20"
                )}
              >
                {method}
              </button>
            );
          })}
        </div>
        {validationErrors.method && (
          <p className="text-[10px] text-red-400 mt-1">{validationErrors.method}</p>
        )}
      </div>
    );
  };

  const renderCurlPreview = () => {
    const payload = constructPayload();
    const curlCommand = `curl -X PUT http://localhost:8080/__chaos/rules/${payload.id} \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(payload, null, 2).replace(/'/g, "'\\''")}'`;

    return (
      <div className="space-y-2 pt-6 border-t border-text-100/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-text-100/50 uppercase tracking-wider text-[10px] font-bold">
            <Terminal className="w-3 h-3" />
            curl Preview
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(curlCommand);
              // Maybe add a temporary "Copied!" state
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-text-100/5 hover:bg-text-100/10 text-text-100/40 hover:text-text-100 text-[10px] transition-colors"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        </div>
        <div className="relative group">
          <pre className="bg-bg-900 p-4 rounded-xl border border-text-100/10 text-[11px] text-text-100/70 font-mono overflow-x-auto leading-relaxed max-h-[250px] custom-scrollbar">
            {curlCommand}
          </pre>
        </div>
      </div>
    );
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

    // Generic Selector Handling
    if (category.id === 'latency' || category.id === 'network-tcp' || category.id === 'http-status' || category.id === 'cors-csp' || category.id === 'routing' || category.id === 'json-corruption' || category.id === 'layout-shift' || category.id === 'auth-session' || category.id === 'client-chaos') {

      let effectiveUriRegex = "";
      if (formValues.target_type === 'api' && formValues.uri_regex) {
        effectiveUriRegex = formValues.uri_regex;
      } else if (formValues.target_type === 'regex' && formValues.custom_regex) {
        effectiveUriRegex = formValues.custom_regex;
      } else if (formValues.uri) {
        effectiveUriRegex = formValues.uri.replace(/\//g, '\\/');
      } else if (formValues.target_type === 'assets' && formValues.assets_selected?.length > 0) {
        effectiveUriRegex = formValues.assets_selected.map((a: string) => a.replace('.', '\\.')).join('|') + '$';
      }

      const isApi = formValues.target_type === 'api' ||
        effectiveUriRegex.includes('gateway') ||
        (formValues.uri && formValues.uri.includes('gateway'));

      if (isApi) {
        payload.selectors.location_tag = 'gateway_api';
        if (effectiveUriRegex) {
          payload.selectors.uri_regex = effectiveUriRegex;
        }
        if (formValues.source_app) {
          payload.selectors.source_app = formValues.source_app;
        }

        // Methods only relevant for API
        const methods = formValues.method || [];
        if (methods.length > 0 && methods.length < HTTP_METHODS.length) {
          payload.selectors.method = methods;
        }
      } else {
        // Non-API flow
        if (effectiveUriRegex) {
          payload.selectors.uri_regex = effectiveUriRegex;
        }
        if (formValues.location_tag && formValues.location_tag !== 'global') {
          payload.selectors.location_tag = formValues.location_tag;
        }
        if (formValues.target_type === 'extension' && formValues.extension) {
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
      } else if (selectedType.id === 'normal-distribution') {
        payload.action_params = {
          model: 'normal',
          mu: Number(formValues.mean),
          sigma: Number(formValues.std_dev),
          max_cap_ms: Number(formValues.max_cap) || undefined
        };
      } else if (selectedType.id === 'exponential') {
        payload.action_params = {
          model: 'exponential',
          mean_ms: Number(formValues.mean),
          max_cap_ms: Number(formValues.max_cap) || undefined
        };
      } else if (selectedType.id === 'step-bimodal') {
        payload.action_params = {
          model: 'step',
          normal_ms: Number(formValues.normal_delay) || 200,
          spike_ms: Number(formValues.spike_delay) || 15000,
          spike_probability: Number(formValues.spike_probability) || 5
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
          ...(formValues.content_type ? { content_type: formValues.content_type } : {}),
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
    } else if (category.id === 'json-corruption') {
      payload.phase = 'body_filter';
      if (selectedType.id === 'corrupt-json') {
        payload.action = 'corrupt_json';
        payload.action_params = {
          strategy: formValues.strategy || 'inject_garbage'
        };
      } else if (selectedType.id === 'wrong-types') {
        payload.action = 'wrong_types';
      } else if (selectedType.id === 'replace-value') {
        payload.action = 'replace_json_value';
        payload.action_params = {
          field: formValues.field,
          value: formValues.value
        };
      } else if (selectedType.id === 'remove-fields') {
        payload.action = 'remove_json_fields';
        payload.action_params = {
          fields: Array.isArray(formValues.fields) ? formValues.fields : (typeof formValues.fields === 'string' ? formValues.fields.split(',').map(s => s.trim()) : [])
        };
      } else if (selectedType.id === 'invalid-json') {
        payload.action = 'invalid_json';
        payload.action_params = {
          payload: formValues.payload
        };
      } else if (selectedType.id === 'empty-response') {
        payload.action = 'empty_response';
      } else if (selectedType.id === 'wrong-structure') {
        payload.action = 'wrong_json_structure';
        payload.action_params = {
          payload: formValues.payload
        };
      }
    } else if (category.id === 'layout-shift') {
      payload.phase = 'body_filter';
      if (selectedType.id === 'inject-cls') {
        payload.action = 'inject_cls';
        payload.action_params = {
          mode: formValues.mode || 'banner',
          height_px: Number(formValues.height_px) || 1200,
          delay_ms: Number(formValues.delay_ms) || 1000,
          animation_ms: Number(formValues.animation_ms) || 10,
          max_shifts: Number(formValues.max_shifts) || 1,
          text: formValues.text,
          color: formValues.color,
          sticky: !!formValues.sticky,
          z_index: Number(formValues.z_index) || 9999
        };
      }
    } else if (category.id === 'auth-session') {
      if (selectedType.id === 'corrupt-request-cookies') {
        payload.phase = 'access';
        payload.action = 'corrupt_request_cookies';
      } else if (selectedType.id === 'broken-session') {
        payload.phase = 'header_filter';
        const strategy = formValues.strategy || 'static';
        if (strategy === 'static') {
          payload.action = 'broken_session';
          payload.action_params = {
            cookie_name: formValues.cookie_name || 'session',
            cookie_val: formValues.cookie_val || 'CHAOS_INVALID_TOKEN',
            cookie_path: formValues.cookie_path || '/'
          };
        } else if (strategy === 'malformed') {
          payload.action = 'add_headers';
          payload.action_params = {
            headers: {
              'Set-Cookie': formValues.cookie_value || 'auth_token=!!!_MALFORMED_DATA_###; Path=/; HttpOnly'
            }
          };
        } else if (strategy === 'strip') {
          payload.action = 'remove_headers';
          payload.action_params = {
            headers: ['Set-Cookie']
          };
        }
      } else if (selectedType.id === '401-unauthorized' || selectedType.id === '403-forbidden') {
        payload.action = 'http_status';
        payload.action_params = {
          status: selectedType.id === '403-forbidden' ? 403 : 401,
          body: formValues.message || (formValues.reasons ? JSON.stringify({ error: formValues.reasons }) : undefined)
        };
      } else if (selectedType.id === 'intermittent-401') {
        payload.action = 'intermittent_401';
        payload.action_params = {
          rate: Number(formValues.rate) || 30,
          reasons: formValues.reasons || ["Token expired", "Revoked", "Invalid claims"]
        };
      }
    } else if (category.id === 'client-chaos') {
      payload.phase = 'body_filter';
      if (selectedType.id === 'inject-js-error') {
        payload.action = 'inject_js_error';
        payload.action_params = {
          script: formValues.script,
          target: '</body>'
        };
      } else if (selectedType.id === 'inject-long-task') {
        payload.action = 'inject_long_task';
        payload.action_params = {
          duration_ms: Number(formValues.duration_ms) || 3000,
          delay_ms: Number(formValues.delay_ms) || 500
        };
      } else if (selectedType.id === 'inject-fetch-override') {
        payload.action = 'inject_fetch_override';
        let corruptBody = formValues.corrupt_body;
        try {
          if (typeof corruptBody === 'string') {
            corruptBody = JSON.parse(corruptBody);
          }
        } catch (e) {
          console.error("Failed to parse corrupt_body JSON", e);
        }
        payload.action_params = {
          corrupt_body: corruptBody,
          script: formValues.script
        };
      } else if (selectedType.id === 'inject-console-spam') {
        payload.action = 'inject_console_spam';
        payload.action_params = {
          count: Number(formValues.count) || 500
        };
      }
    } else if (category.id === 'ttfb') {
      payload.phase = 'access';
      payload.action = 'ttfb';
      // TTFB targets the API/frontend layer via location_tag; defaults to 'api'
      const ttfbTag = formValues.location_tag || 'api';
      payload.selectors = ttfbTag !== 'global' ? { location_tag: ttfbTag } : {};
      if (selectedType.id === 'ttfb-fixed') {
        payload.action_params = {
          model: 'fixed',
          delay_ms: Number(formValues.delay_ms) || 3000,
        };
      } else if (selectedType.id === 'ttfb-random') {
        payload.action_params = {
          model: 'uniform',
          min_ms: Number(formValues.min_ms) || 500,
          max_ms: Number(formValues.max_ms) || 5000,
        };
      } else if (selectedType.id === 'ttfb-spike') {
        payload.action_params = {
          model: 'step',
          normal_ms: Number(formValues.normal_ms) || 200,
          spike_ms: Number(formValues.spike_ms) || 10000,
          spike_probability: Number(formValues.spike_probability) || 10,
        };
      }
    } else if (category.id === 'inp-degradation') {
      payload.phase = 'body_filter';
      payload.action = 'inject_inp';
      // INP always targets HTML pages via file_type selector
      payload.selectors = { file_type: formValues.file_type_value || '.html' };
      if (selectedType.id === 'inp-fixed') {
        payload.action_params = {
          mode: formValues.mode || 'interaction',
          delay_ms: Number(formValues.delay_ms) || 400,
        };
      } else if (selectedType.id === 'inp-random') {
        payload.action_params = {
          mode: formValues.mode || 'interaction',
          min_delay_ms: Number(formValues.min_delay_ms) || 100,
          max_delay_ms: Number(formValues.max_delay_ms) || 800,
        };
      } else if (selectedType.id === 'inp-burst') {
        payload.action_params = {
          mode: formValues.mode || 'interaction',
          burst_ms: Number(formValues.burst_ms) || 600,
          burst_every_n: Number(formValues.burst_every_n) || 3,
        };
      }
    }

    return payload;
  };

  const handleDeploy = async () => {
    // Validation for API target type
    if (formValues.target_type === 'api') {
      const errors: Record<string, string> = {};

      if (!formValues.uri_regex || !formValues.uri_regex.trim()) {
        errors.uri_regex = "API Endpoint pattern is required";
      }

      if (!formValues.method || formValues.method.length === 0) {
        errors.method = "At least one HTTP method must be selected";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
    }

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
              await fetch(`/api/chaos/rules/${rule.id}`, {
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

      const deployUrl = `/api/chaos/rules/${payload.id}`;
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
              className="fixed inset-0 bg-bg-900/60 backdrop-blur-sm z-40"
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
                backgroundColor: 'var(--panel-800)',
                borderLeft: "1px solid var(--border)",
                boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.2)",
              }}
            >
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-text-100/5 border border-text-100/10">
                        {category.icon && <category.icon className="w-5 h-5" style={{ color: category.iconColor }} />}
                      </div>
                      <h2 className="text-2xl font-bold text-text-100">
                        {category.title}
                      </h2>
                    </div>
                    <p className="text-sm text-text-100/50 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-lg hover:bg-text-100/10 flex items-center justify-center transition-colors text-text-100/70 hover:text-text-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Rule Name Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-100/70 uppercase tracking-wider text-xs">Rule Name (Optional)</label>
                    <Input
                      type="text"
                      value={formValues.name ?? ''}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder={selectedType?.title || "Enter a custom name"}
                      className="bg-panel-600 border-text-100/10 text-text-100 h-12"
                    />
                  </div>

                  {/* Injection Type Selector (Moved Up) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-100/70 uppercase tracking-wider text-xs">Injection Type</label>
                    <Select
                      value={selectedTypeId}
                      onValueChange={setSelectedTypeId}
                    >
                      <SelectTrigger className="w-full bg-panel-600 border-text-100/10 text-text-100 h-12">
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
                      <div className="flex items-start gap-2 p-3 rounded-lg bg-accent-500/10 border border-accent-500/20 text-sm text-text-100/70 mt-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{selectedType.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Target Section (Reorganized) */}
                  <div className="space-y-6 pt-4 border-t border-text-100/10">
                    {/* Target Type selector is hardcoded in injectionCategories but let's see how it's used */}
                    {/* In this file, target_type is just another field. Let's find it. */}
                    {selectedType && selectedType.fields.find(f => f.id === 'target_type') && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-100/70 uppercase tracking-wider text-xs">Target Type</label>
                        <Select
                          value={formValues.target_type ?? selectedType.fields.find(f => f.id === 'target_type')?.defaultValue}
                          onValueChange={(val) => handleFieldChange('target_type', val)}
                        >
                          <SelectTrigger className="w-full bg-panel-600 border-text-100/10 text-text-100 h-12">
                            <SelectValue placeholder="Select target type" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedType.fields.find(f => f.id === 'target_type')?.options?.map(opt => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Location Tag Selector (Hidden for API) */}
                    {formValues.target_type !== 'api' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-text-100/70 uppercase tracking-wider text-xs">Target Location (location_tag)</label>
                        <Select
                          value={formValues.location_tag ?? 'global'}
                          onValueChange={(val) => handleFieldChange('location_tag', val)}
                        >
                          <SelectTrigger className="w-full bg-panel-600 border-text-100/10 text-text-100 h-12">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global">Global</SelectItem>
                            <SelectItem value="frontend_angular_v1">Angular V1</SelectItem>
                            <SelectItem value="frontend_angular_v2">Angular V2</SelectItem>
                            <SelectItem value="frontend_vue_v1">Vue V1</SelectItem>
                            <SelectItem value="frontend_vue_v2">Vue V2</SelectItem>
                            <SelectItem value="frontend_next_v1">Next.js V1</SelectItem>
                            <SelectItem value="frontend_next_v2">Next.js V2</SelectItem>
                            <SelectItem value="frontend_nuxt_v1">Nuxt V1</SelectItem>
                            <SelectItem value="frontend_nuxt_v2">Nuxt V2</SelectItem>
                            <SelectItem value="frontend_react_v1">React V1</SelectItem>
                            <SelectItem value="frontend_react_v2">React V2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Source App Grid */}
                    {(formValues.target_type === 'api' || formValues.target_type === 'assets') && (
                      renderSourceAppGrid()
                    )}

                    {/* NEW: API Flow Specifics */}
                    {formValues.target_type === 'api' && (
                      <>
                        {renderApiEndpointSelector()}
                        {renderHttpMethodToggles()}
                      </>
                    )}

                    {/* Dynamic Injection Params (Only fields NOT handled above) */}
                    {selectedType && (
                      <div className="space-y-6 pt-2">
                        {getVisibleFields()
                          .filter(f => !['target_type', 'location_tag', 'api_endpoints', 'methods', 'target', 'uri', 'uri_regex'].includes(f.id))
                          .map(field => renderField(field))}
                      </div>
                    )}
                  </div>

                  {/* JSON Preview */}
                  <div className="space-y-2 pt-4 border-t border-text-100/10">
                    <label className="text-sm font-medium text-text-100/50 uppercase tracking-wider text-xs">JSON Preview</label>
                    <pre className="bg-panel-700 p-4 rounded-lg border border-text-100/10 text-xs text-text-100/70 overflow-x-auto">
                      {JSON.stringify(constructPayload(), null, 2)}
                    </pre>
                  </div>

                  {/* curl Preview (NEW) */}
                  {renderCurlPreview()}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-text-100/10 bg-panel-800">
                <button
                  className="w-full py-4 rounded-xl font-bold text-lg bg-accent-500 text-bg-900 hover:bg-accent-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-accent-500/10"
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
