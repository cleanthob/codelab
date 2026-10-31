import { cn } from "cn";
import {
  SelectContent,
  SelectItem,
  Select as SelectRoot,
  SelectTrigger,
  SelectValue,
} from "./primitives";

type SelectProps = {
  value?: string;
  onChange: (value: string) => void;
  options: {
    label: string;
    value: string;
  }[];
  placeholder?: string;
  className?: string;
};

export const Select = ({
  value,
  onChange,
  options,
  placeholder,
  className,
}: SelectProps) => {
  return (
    <SelectRoot value={value} onValueChange={onChange}>
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </SelectRoot>
  );
};
