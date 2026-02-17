import { X, Save, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { INJECTION_CATEGORIES, InjectionField } from '../../data/injectionCategories';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';

interface RuleBuilderPanelProps {
  categoryId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RuleBuilderPanel({ categoryId, isOpen, onClose }: RuleBuilderPanelProps) {
  const category = INJECTION_CATEGORIES.find(c => c.id === categoryId);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("");
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (category && category.types.length > 0) {
      setSelectedTypeId(category.types[0].id);
    }
  }, [category]);

  useEffect(() => {
    // Reset form values when type changes
    const type = category?.types.find(t => t.id === selectedTypeId);
    if (type) {
      const initialValues: Record<string, any> = {};
      type.fields.forEach(field => {
        initialValues[field.id] = field.defaultValue ?? getEmptyValueForType(field.type);
      });
      setFormValues(initialValues);
    }
  }, [selectedTypeId, category]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const getEmptyValueForType = (type: string) => {
    switch (type) {
      case 'number': return 0;
      case 'text': return '';
      case 'textarea': return '';
      case 'checkbox': return false;
      case 'slider': return 0;
      case 'multiselect': return [];
      default: return '';
    }
  };

  if (!isOpen || !category) return null;

  const selectedType = category.types.find(t => t.id === selectedTypeId);

  const renderField = (field: InjectionField) => {
    switch (field.type) {
      case 'number':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2">{field.label}</label>
            <div className="relative">
              <Input
                type="number"
                value={formValues[field.id]}
                onChange={(e) => handleFieldChange(field.id, parseNumber(e.target.value))}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                step={field.step}
              />
              {field.unit && <span className="absolute right-3 top-2.5 text-sm text-white/50">{field.unit}</span>}
            </div>
          </div>
        );
      case 'text':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2">{field.label}</label>
            <Input
              value={formValues[field.id]}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        );
      case 'textarea':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2">{field.label}</label>
            <Textarea
              value={formValues[field.id]}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
            />
          </div>
        );
      case 'slider':
        return (
          <div key={field.id} className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">{field.label}</label>
              <span className="text-sm text-[#FFC857] font-semibold">
                {formValues[field.id]}{field.unit}
              </span>
            </div>
            <Slider
              value={[formValues[field.id]]}
              onValueChange={(val) => handleFieldChange(field.id, val[0])}
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-white/40">
              <span>{field.min || 0}{field.unit}</span>
              <span>{field.max || 100}{field.unit}</span>
            </div>
          </div>
        );
      case 'checkbox':
        return (
          <div key={field.id} className="flex items-center justify-between p-4 rounded-lg mb-4" style={{ backgroundColor: '#14161A' }}>
            <div>
              <div className="font-medium mb-1">{field.label}</div>
              {field.placeholder && <div className="text-sm text-white/50">{field.placeholder}</div>}
            </div>
            <Switch
              checked={formValues[field.id]}
              onCheckedChange={(val) => handleFieldChange(field.id, val)}
            />
          </div>
        );
      case 'select':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2">{field.label}</label>
            <Select
              value={formValues[field.id]}
              onValueChange={(val) => handleFieldChange(field.id, val)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case 'multiselect':
        // Simplified multiselect for now (just a text input that says "Select multiple...")
        // In a real app we'd need a proper multiselect component
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium mb-2">{field.label}</label>
            <div className="text-sm text-white/50 italic border border-white/10 rounded p-2">
              Multi-select not fully implemented in prototype. (Values: {(field.options || []).map(o => o.label).join(', ')})
            </div>
          </div>
        )
      default:
        return null;
    }
  };

  const parseNumber = (val: string) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  }


  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 w-[500px] z-50 overflow-y-auto"
        style={{
          backgroundColor: '#0F1114',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${category.iconColor}20` }}
              >
                <category.icon className="w-5 h-5" style={{ color: category.iconColor }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{category.title}</h2>
                <p className="text-sm text-white/50">Configure injection rules</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Injection Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-3">Injection Type</label>
              <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {category.types.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedType && (
                <div className="mt-2 text-sm text-white/50 flex items-start gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  {selectedType.description}
                </div>
              )}
            </div>

            <div className="h-px bg-white/10 my-6" />

            {/* Dynamic Fields */}
            <div>
              {selectedType?.fields.map(renderField)}
            </div>


            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-white/10 mt-8">
              <button
                className="flex-1 px-6 py-3 rounded-xl font-semibold bg-[#FFC857] text-[#0B0C0F] hover:bg-[#FFD470] transition-all duration-200 flex items-center justify-center gap-2"
                onClick={() => console.log(formValues)}
              >
                <Save className="w-5 h-5" />
                Deploy Rule
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-semibold border border-white/20 text-white/90 hover:bg-white/5 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
