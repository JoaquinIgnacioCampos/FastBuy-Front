export const fmt = (n) => '$' + Number(n ?? 0).toLocaleString('es-AR')

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short', day: 'numeric', month: 'short',
})

const dateLongFormatter = new Intl.DateTimeFormat('es-AR', {
  weekday: 'long', day: 'numeric', month: 'long',
})

export function formatEventDate(iso) {
  if (!iso) return ''
  try {
    return dateFormatter.format(new Date(iso))
  } catch { return '' }
}

export function formatEventDateLong(iso) {
  if (!iso) return ''
  try {
    return dateLongFormatter.format(new Date(iso))
  } catch { return '' }
}
