import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectFilterProps {
  value: number;
  placeholder: string;
  handleChange: (value: string) => void;
  uniqueValues: number[];
  label?: string;
}

export default function SelectFilter({
  value,
  placeholder = "",
  handleChange,
  uniqueValues,
  label = "",
}: SelectFilterProps) {
  return (
    <Select value={String(value)} onValueChange={handleChange}>
      <SelectTrigger className="w-24 h-8 text-sm">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {uniqueValues.map((y) => (
          <SelectItem className="text-sm" key={y} value={String(y)}>
            {y}
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
