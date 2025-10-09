import { useState } from "react"
import { Bot, Info, Sparkles, Users, X } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { AmbientBouncer } from "@/components/visuals/ambient-bouncer"

export function LandingPage() {
  const featureHighlights = [
    {
      Icon: Sparkles,
      title: "Listo en minutos",
      description: "Configura tu sala, invita participantes y colabora sin friccion.",
    },
    {
      Icon: Users,
      title: "Experiencia compartida",
      description: "Gestiona miembros, conversaciones y espacios en tiempo real.",
    },
    {
      Icon: Bot,
      title: "IA integrada",
      description: "Resuelve dudas y automatiza tareas con nuestro agente inteligente.",
    },
  ]

  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="relative isolate h-full overflow-hidden">
      <AmbientBouncer count={14} />
      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-12 overflow-hidden rounded-3xl border bg-background px-6 py-16 text-center shadow-lg shadow-border/20 sm:px-10">
        <div className="relative flex flex-col items-center gap-10">
          <div className="space-y-6">
            <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-6xl">
              <span className="bg-gradient-to-r from-primary via-sky-500 to-primary bg-clip-text text-transparent">
                OnLinex
              </span>
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-muted-foreground sm:text-xl">
              Lanza salas colaborativas, invita a tu equipo en segundos o conversa con nuestra IA
              integrada. Todo desde una unica plataforma disenada para flujos en tiempo real.
            </p>
          </div>
          <div className="flex w-full max-w-4xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-center sm:gap-20">
            <div className="flex w-full max-w-sm flex-col items-start gap-4 text-left">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-foreground">Gestiona tu equipo</h3>
                <p className="text-sm text-muted-foreground">
                  Crea o unete a una sala en segundos y coordina cada paso con tu equipo.
                </p>
              </div>
              <Button asChild className="h-11 w-full">
                <Link to="/rooms/create">Crear una sala</Link>
              </Button>
              <Button asChild variant="secondary" className="h-11 w-full">
                <Link to="/rooms/join">Unirme a una sala</Link>
              </Button>
            </div>
            <div className="flex w-full max-w-sm flex-col items-start gap-3 text-left">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-foreground">Habla con la IA</h3>
                <p className="text-sm text-muted-foreground">
                  Consulta ideas, refina mensajes o automatiza tareas con nuestro agente listo 24/7.
                </p>
              </div>
              <Button asChild variant="outline" className="h-11 w-full">
                <Link to="/ai">Hablar con la IA</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="fixed bottom-6 right-6 z-20 sm:bottom-8 sm:right-8">
          <div className="pointer-events-none absolute inset-0 -z-10 animate-pulse rounded-full bg-primary/20 blur-2xl" />
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary via-sky-500 to-primary text-white shadow-xl shadow-primary/30 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
          >
            <span className="absolute inset-[1px] rounded-full bg-background/30 backdrop-blur-sm transition group-hover:bg-background/20" />
            <Info className="relative h-5 w-5 transition group-hover:rotate-6" aria-hidden="true" />
            <span className="sr-only">Abrir informacion de la pagina</span>
          </button>
        </div>
      </section>

      {showInfo ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 py-10 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-3xl border border-border/70 bg-background/95 p-8 shadow-2xl shadow-primary/10 sm:p-10">
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Cerrar informacion</span>
            </button>
            <div className="space-y-4">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground">Informacion de la pagina</h2>
                <p className="text-sm text-muted-foreground sm:text-base">
                  Descubre como OnLinex acelera tu colaboracion con espacios inteligentes y herramientas
                  disenadas para equipos agiles.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {featureHighlights.map(({ Icon, title, description }) => (
                  <div
                    key={title}
                    className="group rounded-2xl border border-border/70 bg-background/80 p-6 text-start shadow-sm transition hover:border-primary/40 hover:shadow-lg"
                  >
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <Button variant="secondary" onClick={() => setShowInfo(false)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
