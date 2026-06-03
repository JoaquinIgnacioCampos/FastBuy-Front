import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPaymentAccount, linkPaymentAccount, unlinkPaymentAccount } from '../services/api'

export function usePaymentAccount(eventId) {
  return useQuery({
    queryKey: ['payment-account', eventId],
    queryFn: () => getPaymentAccount(eventId),
    enabled: !!eventId,
    staleTime: 30_000,
  })
}

export function useLinkPaymentAccount(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (accessToken) => linkPaymentAccount(eventId, accessToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-account', eventId] }),
  })
}

export function useUnlinkPaymentAccount(eventId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => unlinkPaymentAccount(eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payment-account', eventId] }),
  })
}
