/** Category prefixes to strip for human-friendly names. FCTH_ before FCT_ to avoid partial match. */
const PREFIXES = ['FCTH_', 'FCT_', 'MAP_', 'REF_', 'DIM_', 'AUX_']

/** Convert "FCTH_CURRENCY_CONVERSION_RATE" → "Currency Conversion Rate" */
export function toHumanName(tableName: string): string {
  let name = tableName
  for (const p of PREFIXES) {
    if (name.startsWith(p)) {
      name = name.slice(p.length)
      break
    }
  }
  return name
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}
