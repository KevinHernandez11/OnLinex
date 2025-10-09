import { Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { AiChat } from "@/components/rooms/ai-chat"
import { useSession } from "@/context/session-context"
import { useRequireSession } from "@/hooks/use-require-session"

export function AiChatPage() {
  const { session, isLoading } = useRequireSession()
  const { clearSession } = useSession()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <section className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </section>
    )
  }

  if (!session) {
    return null
  }

  function handleUnauthorized() {
    clearSession()
    navigate(`/login?redirect=${encodeURIComponent("/ai")}`, { replace: true })
  }

  return (
    <section className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 overflow-hidden rounded-3xl border bg-card/70 px-6 py-12 shadow-xl shadow-primary/10 sm:px-10 md:py-16">
      <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-1/2 h-72 w-72 translate-x-1/2 rounded-full bg-sky-500/15 blur-3xl" />
      <div className="relative flex flex-col gap-4 text-left">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          IA colaborativa
        </span>
        <h1 className="text-3xl font-semibold sm:text-4xl">Conversaciones con inteligencia</h1>
        <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
          Crea conversaciones dedicadas, retómalas cuando quieras y mantén todo el contexto
          organizado. Nuestra IA está lista para ayudarte con ideas, resúmenes y respuestas.
        </p>
      </div>
      <div className="relative rounded-2xl border border-border/70 bg-background/85 p-4 shadow-lg shadow-primary/5 backdrop-blur-sm sm:p-6">
        <AiChat
          accessToken={session.token}
          tokenType={session.tokenType}
          onUnauthorized={handleUnauthorized}
        />
      </div>
    </section>
  )
}
