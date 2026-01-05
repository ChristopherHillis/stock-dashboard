export default function Loading() {
  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm">
      <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
      <span>Fetching data…</span>
    </div>
  );
}