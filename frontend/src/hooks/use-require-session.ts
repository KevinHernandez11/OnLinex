import { useEffect, useMemo } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { useSession } from "@/context/session-context"

export function useRequireSession() {
  const { session, isLoading } = useSession()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTarget = useMemo(
    () => `${location.pathname}${location.search}${location.hash}`,
    [location.hash, location.pathname, location.search],
  )

  useEffect(() => {
    if (isLoading || session) {
      return
    }

    navigate(`/temp-access?redirect=${encodeURIComponent(redirectTarget)}`, {
      replace: true,
    })
  }, [session, isLoading, navigate, redirectTarget])

  return { session, isLoading }
}
