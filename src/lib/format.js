export const fmt = (n) => '$' + Number(n ?? 0).toLocaleString('es-AR')

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short', day: 'numeric', month: 'short',
})

export function formatEventDate(iso) {
  if (!iso) return ''
  try {
    return dateFormatter.format(new Date(iso))
  } catch { return '' }
}
