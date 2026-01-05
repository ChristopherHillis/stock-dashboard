export default function RecentViewed({ items, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          className="px-3 py-1 bg-slate-700 rounded-full text-sm hover:bg-slate-600"
        >
          {s}
        </button>
      ))}
    </div>
  );
}