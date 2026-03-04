"use client";

interface SwitchProps {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, disabled }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onCheckedChange(!checked)}
            className={`
        w-10 h-6 rounded-full relative transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500/50
        ${checked ? "bg-accent-500" : "bg-panel-700 border border-panel-600"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
        >
            <span
                className={`
          block w-4 h-4 rounded-full bg-text-100 shadow-sm transition-transform duration-200 absolute top-1 left-1
          ${checked ? "translate-x-4" : "translate-x-0 bg-text-40"}
        `}
            />
        </button>
    );
}
