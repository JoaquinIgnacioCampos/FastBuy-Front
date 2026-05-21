import * as demo from './demo'
import * as api  from './api'

export const IS_DEMO = !import.meta.env.VITE_API_URL
const svc = IS_DEMO ? demo : api
export const { getOrders, advanceOrder, markDelivered } = svc
