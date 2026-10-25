import { useEffect, useMemo } from 'react'

/** Crée une URL pour un Blob et la libère automatiquement (specs.md § 5). */
export function useObjectUrl(blob: Blob | null | undefined): string | undefined {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : undefined), [blob])

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])

  return url
}
