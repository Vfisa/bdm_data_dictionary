import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, Upload, Globe, Server, AppWindow } from 'lucide-react'
import { MarkdownContent } from '@/lib/markdown-components'
import type { ComponentConfig, ConnectionInfo, DataApp } from '@/lib/types'

interface DocWritersAppsSectionProps {
  writers: ComponentConfig[]
  dataGatewayConfigs: ComponentConfig[]
  customApps: ComponentConfig[]
  dataApps: DataApp[]
  allExpanded: boolean
}

export function DocWritersAppsSection({
  writers,
  dataGatewayConfigs,
  customApps,
  dataApps,
  allExpanded,
}: DocWritersAppsSectionProps) {
  const hasContent = writers.length > 0 || dataGatewayConfigs.length > 0 || customApps.length > 0 || dataApps.length > 0

  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-1">
        6. Data Writers, Custom Applications & Data Apps
      </h2>
      <hr className="border-[var(--border)] mb-4" />

      {!hasContent ? (
        <p className="text-sm text-[var(--muted-foreground)] italic">No writer, application, or data app configurations found.</p>
      ) : (
        <div className="space-y-6">
          {/* 6a. Data Writers */}
          {writers.length > 0 && (
            <div id="doc-writers">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">6a. Data Writers</h3>
              <div className="space-y-2">
                {writers.map(w => (
                  <WriterCard key={w.configId} config={w} allExpanded={allExpanded} />
                ))}
              </div>
            </div>
          )}

          {/* 6b. Data Gateway */}
          {dataGatewayConfigs.length > 0 && (
            <div id="doc-data-gateway">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">6b. Data Gateway</h3>
              <div className="space-y-2">
                {dataGatewayConfigs.map(config => (
                  <DataGatewayCard key={config.configId} config={config} allExpanded={allExpanded} />
                ))}
              </div>
            </div>
          )}

          {/* 6c. Custom Applications */}
          {customApps.length > 0 && (
            <div id="doc-custom-apps">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">6c. Custom Applications</h3>
              <div className="space-y-2">
                {customApps.map(app => (
                  <CustomAppCard key={app.configId} config={app} allExpanded={allExpanded} />
                ))}
              </div>
            </div>
          )}

          {/* 6d. Data Apps */}
          {dataApps.length > 0 && (
            <div id="doc-data-apps">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">6d. Data Apps</h3>
              <div className="space-y-2">
                {dataApps.map(app => (
                  <DataAppCard key={app.id} app={app} allExpanded={allExpanded} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WriterCard({ config, allExpanded }: { config: ComponentConfig; allExpanded: boolean }) {
  const [open, setOpen] = useState(true)
  const isOpen = allExpanded || open

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <button
        className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-[var(--accent)]/30 transition-colors"
        onClick={() => setOpen(prev => !prev)}
      >
        {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" /> : <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />}
        <span title="Writer"><Upload className="h-4 w-4 shrink-0 text-red-500" aria-hidden="true" /></span>
        <span className="text-sm font-medium text-[var(--foreground)]">{config.configName}</span>
        <span className="text-xs text-[var(--muted-foreground)]">{config.componentName}</span>
        {config.keboolaUrl && (
          <a href={config.keboolaUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-[var(--primary)]" onClick={e => e.stopPropagation()} title="Open in Keboola">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </button>
      {isOpen && (
        <div className="border-t border-[var(--border)] px-4 py-2 space-y-1.5 text-xs">
          {config.description && (
            <div className="text-[var(--muted-foreground)]">
              <MarkdownContent content={config.description} />
            </div>
          )}
          {config.inputTables.length > 0 && (
            <div className="text-[var(--muted-foreground)]">
              <span className="font-medium">Input tables:</span>{' '}
              {config.inputTables.map((t, i) => (
                <span key={t}>
                  {i > 0 && ', '}
                  <span className="font-mono text-blue-500">{t.split('.').pop()}</span>
                </span>
              ))}
            </div>
          )}
          {config.configRows && config.configRows.length > 0 && (
            <div className="space-y-0.5">
              <div className="font-medium text-[var(--muted-foreground)]">Row configs:</div>
              {config.configRows.map((row, i) => (
                <div key={i} className="pl-2 text-[var(--muted-foreground)]">
                  {row.name}{row.incremental !== null && <span> &middot; {row.incremental ? 'Incremental' : 'Full'}</span>}
                </div>
              ))}
            </div>
          )}
          {config.connectionInfo && <ConnectionTable info={config.connectionInfo} />}
        </div>
      )}
    </div>
  )
}

function DataGatewayCard({ config, allExpanded }: { config: ComponentConfig; allExpanded: boolean }) {
  const [open, setOpen] = useState(true)
  const isOpen = allExpanded || open

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <button
        className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-[var(--accent)]/30 transition-colors"
        onClick={() => setOpen(prev => !prev)}
      >
        {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" /> : <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />}
        <span title="Data Gateway"><Server className="h-4 w-4 shrink-0 text-indigo-500" aria-hidden="true" /></span>
        <span className="text-sm font-medium text-[var(--foreground)]">{config.configName}</span>
        {config.keboolaUrl && (
          <a href={config.keboolaUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-[var(--primary)]" onClick={e => e.stopPropagation()} title="Open in Keboola">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </button>
      {isOpen && (
        <div className="border-t border-[var(--border)] px-4 py-2 space-y-1.5 text-xs">
          {config.description && (
            <div className="text-[var(--muted-foreground)]">
              <MarkdownContent content={config.description} />
            </div>
          )}

          {/* Connection info */}
          {config.connectionInfo && <ConnectionTable info={config.connectionInfo} />}

          {/* Per-row table list */}
          {config.configRows && config.configRows.length > 0 && (
            <div className="space-y-0.5">
              <div className="font-medium text-[var(--muted-foreground)]">Tables ({config.configRows.length}):</div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-[var(--muted-foreground)]">
                      <th className="pr-3 py-0.5 font-medium">Name</th>
                      <th className="pr-3 py-0.5 font-medium">Source</th>
                      <th className="pr-3 py-0.5 font-medium">Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {config.configRows.map((row, i) => (
                      <tr key={i} className="border-t border-[var(--border)]/50">
                        <td className="pr-3 py-0.5 text-[var(--foreground)]">{row.name}</td>
                        <td className="pr-3 py-0.5 font-mono text-[var(--muted-foreground)]">
                          {row.inputTables.length > 0
                            ? row.inputTables.map(t => t.split('.').pop()).join(', ')
                            : row.tableId?.split('.').pop() || '\u2014'}
                        </td>
                        <td className="pr-3 py-0.5">
                          {row.incremental === true && <span className="text-blue-500">Incremental</span>}
                          {row.incremental === false && <span className="text-green-500">Clone</span>}
                          {row.incremental === null && <span className="text-[var(--muted-foreground)]">{'\u2014'}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CustomAppCard({ config, allExpanded }: { config: ComponentConfig; allExpanded: boolean }) {
  const [open, setOpen] = useState(true)
  const isOpen = allExpanded || open

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <button
        className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-[var(--accent)]/30 transition-colors"
        onClick={() => setOpen(prev => !prev)}
      >
        {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" /> : <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />}
        <span title="Application"><Globe className="h-4 w-4 shrink-0 text-teal-500" aria-hidden="true" /></span>
        <span className="text-sm font-medium text-[var(--foreground)]">{config.configName}</span>
        <span className="text-xs text-[var(--muted-foreground)]">{config.componentName}</span>
        {config.keboolaUrl && (
          <a href={config.keboolaUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-[var(--primary)]" onClick={e => e.stopPropagation()} title="Open in Keboola">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </button>
      {isOpen && (
        <div className="border-t border-[var(--border)] px-4 py-2 space-y-1.5 text-xs">
          {config.description && (
            <div className="text-[var(--muted-foreground)]">
              <MarkdownContent content={config.description} />
            </div>
          )}
          {config.inputTables.length > 0 && (
            <div className="text-[var(--muted-foreground)]">
              <span className="font-medium">Input:</span>{' '}
              {config.inputTables.map((t, i) => (
                <span key={t}>
                  {i > 0 && ', '}
                  <span className="font-mono text-blue-500">{t.split('.').pop()}</span>
                </span>
              ))}
            </div>
          )}
          {config.outputTables.length > 0 && (
            <div className="text-[var(--muted-foreground)]">
              <span className="font-medium">Output:</span>{' '}
              {config.outputTables.map((t, i) => (
                <span key={t}>
                  {i > 0 && ', '}
                  <span className="font-mono text-blue-500">{t.split('.').pop()}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DataAppCard({ app, allExpanded }: { app: DataApp; allExpanded: boolean }) {
  const [open, setOpen] = useState(true)
  const isOpen = allExpanded || open

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
      <button
        className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-[var(--accent)]/30 transition-colors"
        onClick={() => setOpen(prev => !prev)}
      >
        {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" /> : <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />}
        <span title="Data App"><AppWindow className="h-4 w-4 shrink-0 text-pink-500" aria-hidden="true" /></span>
        <span className="text-sm font-medium text-[var(--foreground)]">{app.name}</span>
        {app.type && <span className="text-xs text-[var(--muted-foreground)]">{app.type}</span>}
        {app.keboolaUrl && (
          <a href={app.keboolaUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-[var(--primary)]" onClick={e => e.stopPropagation()} title="Open in Keboola">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </button>
      {isOpen && (
        <div className="border-t border-[var(--border)] px-4 py-2 space-y-1.5 text-xs">
          {app.description && (
            <div className="text-[var(--muted-foreground)]">
              <MarkdownContent content={app.description} />
            </div>
          )}
          <div className="space-y-0.5 text-[var(--muted-foreground)]">
            {app.gitRepository && (
              <div>
                <span className="font-medium">Repository:</span>{' '}
                <a href={app.gitRepository} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
                  {app.gitRepository}
                </a>
                {app.gitBranch && <span> ({app.gitBranch})</span>}
              </div>
            )}
            {app.authType && (
              <div><span className="font-medium">Authentication:</span> {app.authType}</div>
            )}
            {app.deploymentUrl && (
              <div>
                <span className="font-medium">Deployment:</span>{' '}
                <a href={app.deploymentUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
                  {app.deploymentUrl}
                </a>
              </div>
            )}
            {app.autoSuspendAfterSeconds !== null && (
              <div><span className="font-medium">Auto-suspend:</span> {app.autoSuspendAfterSeconds}s</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/** Small key/value table for connection details */
function ConnectionTable({ info }: { info: ConnectionInfo }) {
  const rows = [
    { label: 'Host', value: info.host },
    { label: 'Schema', value: info.schema },
    { label: 'Warehouse', value: info.warehouse },
    { label: 'Auth', value: info.loginType },
    { label: 'Driver', value: info.driver },
  ].filter(r => r.value)

  if (rows.length === 0) return null

  return (
    <div className="overflow-x-auto rounded border border-[var(--border)]">
      <table className="w-full text-xs">
        <tbody>
          {rows.map(({ label, value }) => (
            <tr key={label} className="border-b border-[var(--border)] last:border-b-0">
              <td className="px-2.5 py-1 font-medium text-[var(--muted-foreground)] whitespace-nowrap w-24">{label}</td>
              <td className="px-2.5 py-1 font-mono text-[var(--foreground)]">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
