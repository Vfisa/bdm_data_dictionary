import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, Upload, Globe, Server, AppWindow } from 'lucide-react'
import type { ComponentConfig, DataApp } from '@/lib/types'

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
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
        6. Data Writers, Custom Applications & Data Apps
      </h2>

      {!hasContent ? (
        <p className="text-sm text-[var(--muted-foreground)] italic">No writer, application, or data app configurations found.</p>
      ) : (
        <div className="space-y-6">
          {/* 6a. Data Writers */}
          {writers.length > 0 && (
            <div>
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
            <div>
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
            <div>
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
            <div>
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
  const [open, setOpen] = useState(false)
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
          {config.description && <p className="text-[var(--muted-foreground)]">{config.description}</p>}
          {config.inputTables.length > 0 && (
            <div className="text-[var(--muted-foreground)]">
              <span className="font-medium">Input tables:</span>{' '}
              {config.inputTables.map(t => t.split('.').pop()).join(', ')}
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
          {config.connectionInfo && (
            <div className="text-[var(--muted-foreground)]">
              <span className="font-medium">Connection:</span>{' '}
              {[config.connectionInfo.host, config.connectionInfo.schema, config.connectionInfo.warehouse].filter(Boolean).join(' / ')}
              {config.connectionInfo.driver && <span> ({config.connectionInfo.driver})</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DataGatewayCard({ config, allExpanded }: { config: ComponentConfig; allExpanded: boolean }) {
  const [open, setOpen] = useState(false)
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
          {config.description && <p className="text-[var(--muted-foreground)]">{config.description}</p>}

          {/* Connection info */}
          {config.connectionInfo && (
            <div className="text-[var(--muted-foreground)]">
              <span className="font-medium">Connection:</span>{' '}
              {[
                config.connectionInfo.host,
                config.connectionInfo.schema && `schema: ${config.connectionInfo.schema}`,
                config.connectionInfo.warehouse && `warehouse: ${config.connectionInfo.warehouse}`,
                config.connectionInfo.loginType && `auth: ${config.connectionInfo.loginType}`,
              ].filter(Boolean).join(' | ')}
            </div>
          )}

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
                            : row.tableId?.split('.').pop() || '—'}
                        </td>
                        <td className="pr-3 py-0.5">
                          {row.incremental === true && <span className="text-blue-500">Incremental</span>}
                          {row.incremental === false && <span className="text-green-500">Clone</span>}
                          {row.incremental === null && <span className="text-[var(--muted-foreground)]">—</span>}
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
  const [open, setOpen] = useState(false)
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
          {config.description && <p className="text-[var(--muted-foreground)]">{config.description}</p>}
          {config.inputTables.length > 0 && (
            <div className="text-[var(--muted-foreground)]">
              <span className="font-medium">Input:</span>{' '}
              {config.inputTables.map(t => t.split('.').pop()).join(', ')}
            </div>
          )}
          {config.outputTables.length > 0 && (
            <div className="text-[var(--muted-foreground)]">
              <span className="font-medium">Output:</span>{' '}
              {config.outputTables.map(t => t.split('.').pop()).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DataAppCard({ app, allExpanded }: { app: DataApp; allExpanded: boolean }) {
  const [open, setOpen] = useState(false)
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
          {app.description && <p className="text-[var(--muted-foreground)]">{app.description}</p>}
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
