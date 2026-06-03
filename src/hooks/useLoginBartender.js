import { useMutation } from '@tanstack/react-query'
import { loginBartender } from '../services/api'

export function useLoginBartender() {
  return useMutation({
    mutationFn: ({ username, password }) => loginBartender(username, password),
  })
}
