let orders = [
  { id: 'FB35', total: 9000, items: [{ pid: 'p1', q: 2 }, { pid: 'p11', q: 1 }], status: 'queue',     bar: 'north', time: '2:14' },
  { id: 'FB36', total: 9700, items: [{ pid: 'p5', q: 1 }, { pid: 'p6',  q: 1 }], status: 'queue',     bar: 'north', time: '3:40' },
  { id: 'FB37', total: 7500, items: [{ pid: 'p9', q: 3 }],                        status: 'preparing', bar: 'north', time: '1:05' },
  { id: 'FB33', total: 5600, items: [{ pid: 'p2', q: 2 }],                        status: 'ready',     bar: 'north', time: '0:32' },
  { id: 'FB21', total: 10700, items: [{ pid: 'p7', q: 1 }, { pid: 'p8', q: 1 }], status: 'queue',     bar: 'south', time: '4:12' },
  { id: 'FB22', total: 5500, items: [{ pid: 'p6', q: 1 }],                        status: 'ready',     bar: 'south', time: '1:55' },
]

export function getOrders(barId) {
  return orders.filter(o => o.bar === barId && o.status !== 'delivered')
}

export function advanceOrder(id) {
  orders = orders.map(o => {
    if (o.id !== id) return o
    if (o.status === 'queue' || o.status === 'preparing') return { ...o, status: 'ready' }
    return o
  })
}

export function markDelivered(id) {
  orders = orders.map(o => o.id === id ? { ...o, status: 'delivered' } : o)
}
