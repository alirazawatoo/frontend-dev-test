import { Select } from '@/components';
import { STATUS_FILTERS } from '@/lib';
import type { StatusFilter } from '@/types';

type StatusFilterSelectProps = {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
};

/** Dropdown to filter the order list by status. */
export function StatusFilterSelect({ value, onChange }: StatusFilterSelectProps) {
  return (
    <Select
      aria-label="Filter by status"
      value={value}
      onChange={(event) => onChange(event.target.value as StatusFilter)}
      className="h-11 sm:w-44"
    >
      {STATUS_FILTERS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
