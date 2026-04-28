import { useEffect, useMemo, useState } from "react";
import type { NormalizedWorkbook } from "./contracts/normalized";
import {
  getDeveloperById,
  listMonths,
  listTeams,
  loadWorkbook,
} from "./data/workbookClient";
import { calculateAssignmentMetrics } from "./metrics/assignmentMetrics";
import { interpretAssignmentMetrics } from "./metrics/interpretation";
import { summarizeTeamMonth } from "./metrics/managerSummary";

type ViewState = "loading" | "ready" | "error";
type ScreenMode = "ic" | "manager";

const kpiConfig = [
  { key: "leadTimeForChangesDays", label: "Lead time for changes", suffix: "days" },
  { key: "cycleTimeDays", label: "Cycle time", suffix: "days" },
  { key: "bugRatePercent", label: "Bug rate", suffix: "%" },
  { key: "deploymentFrequency", label: "Deployment frequency", suffix: "deployments" },
  { key: "prThroughput", label: "PR throughput", suffix: "merged PRs" },
] as const;

function App() {
  const [state, setState] = useState<ViewState>("loading");
  const [errorMessage, setErrorMessage] = useState("Unable to load workbook data.");
  const [mode, setMode] = useState<ScreenMode>("ic");
  const [workbook, setWorkbook] = useState<NormalizedWorkbook | null>(null);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const data = await loadWorkbook();
        if (!active) {
          return;
        }

        const months = listMonths(data);
        const teams = listTeams(data);
        setWorkbook(data);
        setSelectedDeveloperId(data.developers[0]?.developerId ?? "");
        setSelectedTeam(teams[0] ?? "");
        setSelectedMonth(months[0] ?? "");
        setState("ready");
      } catch (error) {
        if (!active) {
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : "Unable to load workbook data.");
        setState("error");
      }
    }

    void initialize();
    return () => {
      active = false;
    };
  }, []);

  const months = useMemo(() => (workbook ? listMonths(workbook) : []), [workbook]);
  const teams = useMemo(() => (workbook ? listTeams(workbook) : []), [workbook]);
  const selectedDeveloper = useMemo(
    () => (workbook ? getDeveloperById(workbook.developers, selectedDeveloperId) : undefined),
    [workbook, selectedDeveloperId],
  );

  const metrics = useMemo(() => {
    if (!workbook || !selectedDeveloperId || !selectedMonth) {
      return null;
    }
    return calculateAssignmentMetrics(workbook, selectedDeveloperId, selectedMonth);
  }, [selectedDeveloperId, selectedMonth, workbook]);

  const interpretation = useMemo(
    () => (metrics ? interpretAssignmentMetrics(metrics) : null),
    [metrics],
  );
  const managerSummary = useMemo(() => {
    if (!workbook || !selectedTeam || !selectedMonth) {
      return null;
    }
    return summarizeTeamMonth(workbook, selectedTeam, selectedMonth);
  }, [workbook, selectedTeam, selectedMonth]);

  if (state === "loading") {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
        <section className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium text-slate-600">Loading FlowLens IC view...</p>
          <div className="mt-4 space-y-3">
            <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </section>
      </main>
    );
  }

  if (state === "error") {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
        <section className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
          <p className="text-sm font-semibold text-red-900">FlowLens could not load this view.</p>
          <p className="mt-2 text-sm text-red-800">{errorMessage}</p>
          <p className="mt-4 text-xs text-red-700">
            Check the local normalized workbook file and try again.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-indigo-700">FlowLens</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {mode === "ic"
              ? "One developer, one month, one clear story"
              : "Team rollup summary for managers"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {mode === "ic"
              ? "Use the selectors to review delivery speed, quality signal, and practical next steps."
              : "A compact extension to spot team-level health and where support may be needed."}
          </p>
          <div className="mt-4 inline-flex rounded-lg border border-slate-200 p-1">
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm ${
                mode === "ic" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => setMode("ic")}
            >
              IC view
            </button>
            <button
              type="button"
              className={`rounded-md px-3 py-1.5 text-sm ${
                mode === "manager"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
              onClick={() => setMode("manager")}
            >
              Manager summary
            </button>
          </div>
        </header>

        {mode === "ic" ? (
          <>
            <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Developer</span>
                <select
                  value={selectedDeveloperId}
                  onChange={(event) => setSelectedDeveloperId(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {workbook?.developers.map((developer) => (
                    <option key={developer.developerId} value={developer.developerId}>
                      {developer.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Month</span>
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Supporting context
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {selectedDeveloper
                    ? `${selectedDeveloper.name} | Team: ${selectedDeveloper.team} | Manager: ${selectedDeveloper.manager}`
                    : "Select a developer to view team and manager context."}
                </p>
              </div>
            </section>

            {!metrics || !interpretation ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
                Select a developer and month with available records to view KPI cards and narrative.
              </section>
            ) : (
              <>
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  {kpiConfig.map((kpi) => (
                    <article
                      key={kpi.key}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{kpi.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-900">
                        {metrics[kpi.key]}
                        <span className="ml-1 text-sm font-normal text-slate-500">{kpi.suffix}</span>
                      </p>
                    </article>
                  ))}
                </section>

                <section className="grid gap-4 md:grid-cols-5">
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-3">
                    <h2 className="text-base font-semibold text-slate-900">Interpretation</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{interpretation.explanation}</p>
                  </article>

                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
                    <h2 className="text-base font-semibold text-slate-900">Next steps</h2>
                    <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-6 text-slate-700">
                      {interpretation.nextSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </article>
                </section>
              </>
            )}
          </>
        ) : (
          <>
            <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Team</span>
                <select
                  value={selectedTeam}
                  onChange={(event) => setSelectedTeam(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {teams.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Month</span>
                <select
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            {!managerSummary ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
                Select a team and month to view the rollup.
              </section>
            ) : (
              <>
                <section className="grid gap-4 md:grid-cols-4">
                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Active developers</p>
                    <p className="mt-2 text-2xl font-semibold">{managerSummary.activeDevelopers}</p>
                  </article>
                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Avg lead time</p>
                    <p className="mt-2 text-2xl font-semibold">{managerSummary.avgLeadTimeDays} days</p>
                  </article>
                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Avg cycle time</p>
                    <p className="mt-2 text-2xl font-semibold">{managerSummary.avgCycleTimeDays} days</p>
                  </article>
                  <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Avg bug rate</p>
                    <p className="mt-2 text-2xl font-semibold">{managerSummary.avgBugRatePercent}%</p>
                  </article>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-1">
                    <h2 className="text-base font-semibold text-slate-900">Health signal</h2>
                    <p className="mt-3 text-sm text-slate-700">{managerSummary.healthSignal}</p>
                  </article>
                  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:col-span-2">
                    <h2 className="text-base font-semibold text-slate-900">Where the team may need help</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{managerSummary.helpNote}</p>
                  </article>
                </section>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default App;
