import { Badge } from "./badge"
import { Button } from "./button"
import { Filter as FilterIcon, X } from "lucide-react"

export interface FilterOption {
  label: string
  value: string
  count?: number
}

export interface FilterProps {
  title: string
  options: FilterOption[]
  selectedValues: string[]
  onSelect: (value: string) => void
  onClear: () => void
}

export function Filter({
  title,
  options,
  selectedValues,
  onSelect,
  onClear,
}: FilterProps) {
  return (
    <div className="flex flex-col space-y-2 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm font-semibold text-foreground">
          <FilterIcon className="h-4 w-4 text-muted-foreground" />
          <span>Filter by {title}</span>
        </div>
        {selectedValues.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 px-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 p-3 bg-secondary/10 border border-border rounded-lg">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value)
          return (
            <Badge
              key={option.value}
              variant={isSelected ? "chipActive" : "chip"}
              onClick={() => onSelect(option.value)}
              className="px-3 py-1 flex items-center space-x-1.5"
            >
              <span>{option.label}</span>
              {option.count !== undefined && (
                <span className={`text-[10px] px-1 py-0.2 rounded-full font-mono ${
                  isSelected ? "bg-white/20 text-white" : "bg-secondary text-muted-foreground"
                }`}>
                  {option.count}
                </span>
              )}
              {isSelected && <X className="h-3 w-3 ml-1 stroke-[2.5]" />}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
