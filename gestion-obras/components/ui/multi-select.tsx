"use client"

import { useState } from "react"
import { Button } from "./button"
import { Checkbox } from "./checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Command, CommandInput, CommandItem, CommandList } from "./command"

export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

export function MultiSelect({ options, selected, onChange, placeholder }: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const toggleValue = (value: string) => {
    const exists = selected.includes(value)
    const newValues = exists ? selected.filter(v => v !== value) : [...selected, value]
    onChange(newValues)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between">
          {selected.length > 0 ? `${selected.length} seleccionados` : (placeholder || "Seleccione")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-64">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            {options.map(opt => (
              <CommandItem
                key={opt.value}
                onSelect={() => !opt.disabled && toggleValue(opt.value)}
                disabled={opt.disabled}
                className="cursor-pointer gap-2"
              >
                <Checkbox checked={selected.includes(opt.value)} className="mr-2" />
                {opt.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
