function FilterToolbar({ search, onSearchChange, filter, onFilterChange, filterOptions = [], placeholder = "Search..." }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
      {filterOptions.length ? (
        <select
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}

export default FilterToolbar;
