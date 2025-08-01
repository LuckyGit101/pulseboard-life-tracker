import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ToggleTabsProps {
  options?: Array<{ value: string; label: string }>;
  items?: Array<{ value: string; label: string }>;
  value: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  className?: string;
}

const ToggleTabs = ({ options, items, value, onChange, onValueChange, className }: ToggleTabsProps) => {
  // Use items if provided, otherwise fall back to options
  const tabItems = items || options || [];
  const handleChange = onValueChange || onChange || (() => {});

  return (
    <div className={cn("inline-flex bg-muted rounded-lg p-1", className)}>
      {tabItems.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "ghost"}
          size="sm"
          onClick={() => handleChange(option.value)}
          className={cn(
            "transition-all duration-200",
            value === option.value 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-background/50"
          )}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default ToggleTabs;