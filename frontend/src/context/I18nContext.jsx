import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { translations } from '@/i18n/translations'

const I18nContext = createContext(null)

const getValueByPath = (obj, path) => {
  if (!obj) return undefined
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj)
}

const interpolate = (template, vars = {}) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) =>
    vars[key] !== undefined ? vars[key] : ''
  )

export function I18nProvider({
  children,
  defaultLanguage = 'bg',
  storageKey = 'civic-report-language',
}) {
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem(storageKey)
    return stored || defaultLanguage
  })

  useEffect(() => {
    localStorage.setItem(storageKey, language)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language
    }
  }, [language, storageKey])

  const t = useMemo(() => {
    return (key, vars = {}) => {
      const langTable = translations[language]
      const enTable = translations.en
      const raw =
        getValueByPath(langTable, key) ??
        getValueByPath(enTable, key) ??
        key
      if (typeof raw === 'string') {
        return interpolate(raw, vars)
      }
      return raw
    }
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, t]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export default I18nContext
