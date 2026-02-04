import { useQuery } from '@tanstack/react-query'
import { usersService } from '@/services/users'

export function useUserProfile(id) {
  return useQuery({
    queryKey: ['userProfile', id],
    queryFn: () => usersService.getProfile(id),
    enabled: !!id,
  })
}

export function useMySubscriptions() {
  return useQuery({
    queryKey: ['mySubscriptions'],
    queryFn: () => usersService.getMySubscriptions(),
  })
}

export function useLeaderboard(limit) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: () => usersService.getLeaderboard(limit),
  })
}
