export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const REPORT_STATUS = {
  PENDING: 'Pending',
  SENT: 'Sent',
  FINISHED: 'Finished',
}

export const REPORT_STATUS_COLORS = {
  Pending: {
    bg: 'bg-amber-100 dark:bg-amber-900',
    text: 'text-amber-800 dark:text-amber-100',
    border: 'border-amber-200 dark:border-amber-800',
  },
  Sent: {
    bg: 'bg-blue-100 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-100',
    border: 'border-blue-200 dark:border-blue-800',
  },
  Finished: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-100',
    border: 'border-green-200 dark:border-green-800',
  },
}

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
}

export const DEFAULT_MAP_CENTER = {
  lat: 42.6977,
  lng: 23.3219,
}

export const DEFAULT_MAP_ZOOM = 12
