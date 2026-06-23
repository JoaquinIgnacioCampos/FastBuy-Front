import { useMutation } from '@tanstack/react-query'
import { loginAdmin } from '../services/api'

export function useLoginAdmin() {
  return useMutation({
    mutationFn: ({ username, password }) => loginAdmin(username, password),
  })
}
