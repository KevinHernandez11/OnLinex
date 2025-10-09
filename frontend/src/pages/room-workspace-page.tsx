import { useEffect, useState } from "react"
import { ClipboardCheck, ClipboardList, MessageCircle, Users, Zap } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { RoomChat } from "@/components/rooms/room-chat"
import { useRequireSession } from "@/hooks/use-require-session"

export function RoomWorkspacePage() {
  const { session, isLoading } = useRequireSession()
  const navigate = useNavigate()
  const { code } = useParams<{ code: string }>()

  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle")

  useEffect(() => {
    if (copyStatus !== "copied") {
      return
    }

    const timer = setTimeout(() => setCopyStatus("idle"), 2500)
    return () => clearTimeout(timer)
  }, [copyStatus])

  async function handleCopyCode() {
    if (!code) {
      return
    }

    try {
      await navigator.clipboard.writeText(code)
      setCopyStatus("copied")
    } catch (error) {
      console.error("Clipboard error", error)
      setCopyStatus("error")
    }
  }

  if (isLoading) {
    return (
      <section className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Cargando sala...</p>
      </section>
    )
  }

  if (!session || !code) {
    return null
  }

  return (
    <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 overflow-hidden rounded-3xl border bg-card/60 px-6 py-12 text-left shadow-xl shadow-primary/10 sm:px-10 md:py-16">
      <div className="pointer-events-none absolute -top-32 left-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />

      <div className="relative flex flex-col gap-6">
        <div className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          Sala activa
        </div>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold sm:text-4xl">Gestiona tu sala {code}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Coordina a tu equipo, comparte ideas en tiempo real y mantente sincronizado con el nuevo
              espacio de chat ampliado.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/rooms/create")}>
              Crear otra sala
            </Button>
            <Button variant="secondary" onClick={() => navigate("/")}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>

      <div className="relative grid gap-10 lg:grid-cols-[1.6fr_1fr]">
        <RoomChat
          roomCode={code}
          accessToken={session.token}
          tokenType={session.tokenType}
          className="h-[36rem]"
        />

        <aside className="flex flex-col gap-6">
          <div className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-lg shadow-primary/10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold">Comparte el codigo</h2>
                <p className="text-sm text-muted-foreground">
                  Envia este identificador a tus invitados para que se unan al instante.
                </p>
              </div>
              <ClipboardList className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 font-mono text-sm font-semibold text-primary">
              <span>{code}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopyCode}
                className="flex items-center gap-2"
              >
                {copyStatus === "copied" ? (
                  <>
                    <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                    Copiado
                  </>
                ) : (
                  <>
                    <ClipboardList className="h-4 w-4" aria-hidden="true" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
            {copyStatus === "error" ? (
              <p className="mt-2 text-xs text-destructive">
                No pudimos copiar el codigo. Hazlo manualmente mientras revisamos el acceso al
                portapapeles.
              </p>
            ) : null}
          </div>

          <div className="rounded-3xl border border-border/60 bg-background/85 p-6 shadow-lg shadow-primary/10">
            <h2 className="text-lg font-semibold">Dinamica recomendada</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
                <MessageCircle className="mt-1 h-4 w-4 text-primary" aria-hidden="true" />
                <span>
                  Abre la conversacion con una agenda rapida para mantener a todos en la misma pagina.
                </span>
              </li>
              <li className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
                <Users className="mt-1 h-4 w-4 text-primary" aria-hidden="true" />
                <span>
                  Asigna responsables por tema y marca acuerdos directamente en el chat mientras avanzan.
                </span>
              </li>
              <li className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/30 px-4 py-3">
                <Zap className="mt-1 h-4 w-4 text-primary" aria-hidden="true" />
                <span>
                  Aprovecha el flujo en tiempo real para tomar decisiones rapidas y acordar proximos pasos.
                </span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}
