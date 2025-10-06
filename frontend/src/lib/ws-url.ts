const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""
const ENV_WS_BASE_URL = import.meta.env.VITE_WS_URL ?? ""

export function resolveWsBaseUrl() {
  if (ENV_WS_BASE_URL) {
    return ENV_WS_BASE_URL
  }

  if (API_BASE_URL) {
    return API_BASE_URL.replace(/^http/i, (match: string) =>
      match.toLowerCase() === "https" ? "wss" : "ws"
    )
  }

  if (typeof window !== "undefined") {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws"
    return `${protocol}://${window.location.host}`
  }

  return ""
}