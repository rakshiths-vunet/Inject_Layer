
import * as React from "react";
import { X, ChevronsUpDown, Check } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "./command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "./popover";
import { cn } from "./utils";

export interface Option {
    label: string;
    value: string;
    tag?: string; // App name
    tagColor?: string; // Background color for app tag
    typeTag?: string; // Asset type (e.g., JS, Image, CSS)
    typeColor?: string; // Background color for type tag
}

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select items...",
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleUnselect = (item: string) => {
        onChange(selected.filter((i) => i !== item));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between bg-panel-700 border-text-100/10 text-text-100 hover:bg-panel-600 min-h-10 h-auto",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length === 0 && (
                            <span className="text-muted-foreground font-normal">{placeholder}</span>
                        )}
                        {selected.map((item) => {
                            const option = options.find((o) => o.value === item);
                            return (
                                <Badge
                                    key={item}
                                    variant="secondary"
                                    className="mr-1 mb-1 bg-text-100/10 text-text-100 hover:bg-text-100/20 border-none"
                                    style={option?.typeColor ? { borderLeft: `2px solid ${option.typeColor}` } : {}}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUnselect(item);
                                    }}
                                >
                                    {option?.label || item}
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleUnselect(item);
                                            }
                                        }}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleUnselect(item);
                                        }}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </div>
                                </Badge>
                            );
                        })}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-full p-0 bg-panel-600 border-text-100/10 text-text-100 z-[9999]"
                align="start"
                style={{ width: 'var(--radix-popover-trigger-width)' }}
            >
                <Command className="bg-panel-600 text-text-100" shouldFilter={false}>
                    {/* Removing CommandInput because it's not strictly necessary for simple asset selection and might complicate styling/focus. 
              We can add it back if the list becomes long. For assets (5 items) it's overkill. 
              But let's keep the structure ready if needed. 
              Re-adding CommandList for scrolling.
          */}
                    {/* <CommandInput placeholder="Search..." className="border-text-100/10 text-text-100" /> */}
                    <CommandList>
                        {/* <CommandEmpty>No item found.</CommandEmpty> */}
                        <CommandGroup className="max-h-64 overflow-auto">
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => {
                                        onChange(
                                            selected.includes(option.value)
                                                ? selected.filter((item) => item !== option.value)
                                                : [...selected, option.value]
                                        );
                                        // Do not close popover to allow multiple selections
                                        // setOpen(false);
                                    }}
                                    className="data-[selected=true]:bg-text-100/10 aria-selected:bg-text-100/10 text-text-100 hover:bg-text-100/5 cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selected.includes(option.value) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="flex-1 truncate">{option.label}</span>
                                    {(option.typeTag || option.tag) && (
                                        <div className="flex gap-1.5 ml-2">
                                            {option.typeTag && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[9px] px-1.5 py-0 flex items-center justify-center border-none font-medium uppercase tracking-wider h-5"
                                                    style={{ backgroundColor: option.typeColor || 'rgba(255,255,255,0.1)', color: '#fff' }}
                                                >
                                                    {option.typeTag}
                                                </Badge>
                                            )}
                                            {option.tag && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-[9px] px-1.5 py-0 flex items-center justify-center border-none font-medium h-5 whitespace-nowrap"
                                                    style={{ backgroundColor: option.tagColor || 'rgba(255,255,255,0.05)', color: '#fff' }}
                                                >
                                                    {option.tag}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
