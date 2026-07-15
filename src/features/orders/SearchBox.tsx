import { Search, X } from 'lucide-react';

type SearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
};

/** Search input for order number or product name, with a clear button. */
export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="relative flex-1">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search order number or product"
        aria-label="Search orders"
        className="h-11 w-full rounded-lg border border-line bg-surface pl-9 pr-9 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-brand-soft hover:text-ink"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
