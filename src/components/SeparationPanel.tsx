import { AlertTriangle, ShieldCheck, PlugZap, Plug } from 'lucide-react';
import { Card } from './ui';
import { useSeparation } from '../hooks/useSeparation';
import type { SeparationEvent } from '../types';

function fmtDuration(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function fmtTime(iso?: string) {
  if (!iso) return '–';
  return new Date(iso).toLocaleTimeString('de-DE');
}

function ActiveStu({ ev }: { ev: SeparationEvent }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 dark:border-red-700/60 dark:bg-red-900/20">
      <div className="flex items-center gap-3 min-w-0">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 animate-pulse" />
        <div className="min-w-0">
          <div className="font-mono font-semibold text-gray-900 dark:text-gray-100 truncate">
            {ev.a} ↔ {ev.b}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            via {ev.source} · läuft seit {fmtDuration(ev.durationSec)}
          </div>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-semibold text-red-600 dark:text-red-400">
          {ev.lastLateralNm.toFixed(1)} NM · {ev.lastVerticalFt} ft
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          min {ev.minLateralNm.toFixed(1)} NM / {ev.minVerticalFt} ft
        </div>
      </div>
    </div>
  );
}

export default function SeparationPanel() {
  const { data, error } = useSeparation();

  const connected = data?.pluginConnected ?? false;
  const active = data?.active ?? [];
  const history = data?.history ?? [];

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Staffelungsunterschreitungen (STU)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Datenquelle: EuroScope-Plugin (STCA nachgerechnet)
          </p>
        </div>
        <div
          className={`flex items-center gap-2 self-start rounded-full px-3 py-1 text-xs font-medium ${
            connected
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {connected ? <PlugZap className="w-4 h-4" /> : <Plug className="w-4 h-4" />}
          {connected
            ? `Plugin verbunden${
                data?.activeSources.length ? ` · ${data.activeSources.join(', ')}` : ''
              }`
            : 'Plugin nicht verbunden'}
        </div>
      </div>

      {error && !data && (
        <p className="text-sm text-red-500">Fehler: {error}</p>
      )}

      {!connected && (
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
          Noch keine Daten vom EuroScope-Plugin. Build- und Installationsanleitung:{' '}
          <code className="font-mono text-xs">euroscope-plugin/README.md</code>.
        </div>
      )}

      {/* Active STUs */}
      {active.length > 0 ? (
        <div className="space-y-2">
          {active.map((ev) => (
            <ActiveStu key={ev.id} ev={ev} />
          ))}
        </div>
      ) : (
        connected && (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800/60 dark:bg-green-900/20 dark:text-green-300">
            <ShieldCheck className="w-5 h-5" />
            Keine aktiven Staffelungsunterschreitungen.
          </div>
        )
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Verlauf ({data?.stats.historyCount ?? history.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="py-2 pr-4 font-medium">Paarung</th>
                  <th className="py-2 px-3 font-medium text-right">min lateral</th>
                  <th className="py-2 px-3 font-medium text-right">min vertikal</th>
                  <th className="py-2 px-3 font-medium text-right">Dauer</th>
                  <th className="py-2 px-3 font-medium">Quelle</th>
                  <th className="py-2 pl-3 font-medium text-right">Ende</th>
                </tr>
              </thead>
              <tbody>
                {history.map((ev) => (
                  <tr
                    key={ev.id}
                    className="border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <td className="py-2 pr-4 font-mono text-gray-800 dark:text-gray-200">
                      {ev.a} ↔ {ev.b}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {ev.minLateralNm.toFixed(1)} NM
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {ev.minVerticalFt} ft
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums">
                      {fmtDuration(ev.durationSec)}
                    </td>
                    <td className="py-2 px-3 text-gray-500 dark:text-gray-400 font-mono text-xs">
                      {ev.source}
                    </td>
                    <td className="py-2 pl-3 text-right text-gray-500 dark:text-gray-400">
                      {fmtTime(ev.endedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
