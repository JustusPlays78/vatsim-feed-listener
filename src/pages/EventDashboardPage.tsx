import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  PlaneTakeoff,
  PlaneLanding,
  Clock,
  Radio,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Container } from '../components/layout';
import { Card } from '../components/ui';
import SeparationPanel from '../components/SeparationPanel';
import { useEventTraffic } from '../hooks/useEventTraffic';
import type { AtcPosition } from '../types';

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <Card variant="elevated" padding="md" className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${accent}`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {value}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
      </div>
    </Card>
  );
}

const GROUP_ORDER = ['CTR', 'APP', 'TWR', 'DEL/GND'] as const;

function AtcDot({ pos }: { pos: AtcPosition }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 border ${
        pos.online
          ? 'border-green-300 bg-green-50 dark:border-green-700/60 dark:bg-green-900/20'
          : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/40'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${
            pos.online ? 'bg-green-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
          {pos.label}
        </span>
      </div>
      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 shrink-0">
        {pos.online ? `${pos.callsign} · ${pos.frequency}` : 'offline'}
      </span>
    </div>
  );
}

export default function EventDashboardPage() {
  const { data, isLoading, error, lastUpdated, refresh } = useEventTraffic();

  if (isLoading && !data) {
    return (
      <Container size="xl">
        <div className="flex items-center justify-center min-h-[60vh] gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          Lade Event-Daten…
        </div>
      </Container>
    );
  }

  if (error && !data) {
    return (
      <Container size="xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-red-500">
          <AlertTriangle className="w-8 h-8" />
          <p>Fehler beim Laden: {error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Erneut versuchen
          </button>
        </div>
      </Container>
    );
  }

  if (!data) return null;

  const { summary, airports, etaBuckets, atc, history } = data;
  const trend = history.map((s) => ({
    ...s,
    label: new Date(s.t).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));
  const groupedPositions = GROUP_ORDER.map((g) => ({
    group: g,
    positions: atc.positions.filter((p) => p.group === g),
  })).filter((g) => g.positions.length > 0);

  return (
    <Container size="xl">
      <div className="space-y-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.eventName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Live Traffic &amp; Lotsenabdeckung · Datenquelle: VATSIM Feed (15s)
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400">
                Stand {lastUpdated.toLocaleTimeString('de-DE')}
              </span>
            )}
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Aktualisieren
            </button>
          </div>
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatTile
            icon={<PlaneLanding className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
            label="Inbound unterwegs"
            value={summary.inboundAirborne}
            accent="bg-blue-100 dark:bg-blue-900/30"
          />
          <StatTile
            icon={<Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
            label="Inbound geplant (kommt noch)"
            value={summary.inboundPending}
            accent="bg-amber-100 dark:bg-amber-900/30"
          />
          <StatTile
            icon={<PlaneLanding className="w-6 h-6 text-green-600 dark:text-green-400" />}
            label="Gelandet"
            value={summary.arrived}
            accent="bg-green-100 dark:bg-green-900/30"
          />
          <StatTile
            icon={<PlaneTakeoff className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
            label="Outbound (Luft + Boden)"
            value={summary.outboundAirborne + summary.outboundGround}
            accent="bg-purple-100 dark:bg-purple-900/30"
          />
          <StatTile
            icon={<Radio className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
            label="Lotsen besetzt"
            value={`${summary.positionsOnline}/${summary.positionsTotal}`}
            accent="bg-teal-100 dark:bg-teal-900/30"
          />
        </div>

        {/* Demand curve */}
        <Card variant="elevated" padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Inbound-Demand nach ETA
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Anflüge in der Luft, gruppiert nach geschätzter Ankunftszeit (Minuten)
            {summary.inboundFar > 0 && (
              <span className="text-gray-400">
                {' '}· {summary.inboundFar} weitere noch &gt; 2 h entfernt
              </span>
            )}
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={etaBuckets} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip
                  cursor={{ fill: 'rgba(59,130,246,0.08)' }}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Anflüge" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Demand over time */}
        <Card variant="elevated" padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Demand-Verlauf
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Entwicklung über die Zeit (Sampling alle 2 min)
          </p>
          {trend.length > 1 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.4} />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="inboundAirborne"
                    name="Inbound unterwegs"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="inboundPending"
                    name="Inbound geplant"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="arrived"
                    name="Gelandet"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-sm text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              Sammelt Verlaufsdaten… (erster Punkt nach ~12 s, dann alle 2 min)
            </div>
          )}
        </Card>

        {/* ATC coverage */}
        <Card variant="elevated" padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Lotsenabdeckung
          </h2>
          <div className="space-y-5">
            {groupedPositions.map(({ group, positions }) => (
              <div key={group}>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  {group}
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {positions.map((p) => (
                    <AtcDot key={p.id} pos={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {atc.extraControllers.length > 0 && (
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Weitere Stationen im Gebiet
              </div>
              <div className="flex flex-wrap gap-2">
                {atc.extraControllers.map((c) => (
                  <span
                    key={c.callsign}
                    className="text-xs font-mono px-2 py-1 rounded-md bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                  >
                    {c.callsign} · {c.frequency}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Separation / STU (EuroScope plugin) */}
        <SeparationPanel />

        {/* Per-airport breakdown */}
        <Card variant="elevated" padding="lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Verkehr je Flughafen
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-4 font-medium">Flughafen</th>
                  <th className="py-2 px-3 font-medium text-right">Inbound Luft</th>
                  <th className="py-2 px-3 font-medium text-right">Geplant</th>
                  <th className="py-2 px-3 font-medium text-right">Gelandet</th>
                  <th className="py-2 px-3 font-medium text-right">Outbound Luft</th>
                  <th className="py-2 pl-3 font-medium text-right">Outbound Boden</th>
                </tr>
              </thead>
              <tbody>
                {airports.map((a) => (
                  <tr
                    key={a.icao}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <td className="py-2 pr-4">
                      <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                        {a.icao}
                      </span>
                      <span className="text-gray-400 ml-2">{a.name}</span>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">{a.inboundAirborne}</td>
                    <td className="py-2 px-3 text-right tabular-nums text-amber-600 dark:text-amber-400">
                      {a.inboundPending}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums text-green-600 dark:text-green-400">
                      {a.arrived}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">{a.outboundAirborne}</td>
                    <td className="py-2 pl-3 text-right tabular-nums">{a.outboundGround}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Container>
  );
}
