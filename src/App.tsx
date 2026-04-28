function App() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-indigo-700">FlowLens Skeleton</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          Data contracts and pipeline are ready
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          UI is intentionally not implemented yet. Use <code>npm run normalize:data</code> to
          transform workbook input into the normalized shape for the IC flow.
        </p>
      </div>
    </main>
  );
}

export default App;
