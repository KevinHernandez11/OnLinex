import { Bot, Sparkles, Users, ArrowRight, Zap, Shield, Clock } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { AmbientBouncer } from "@/components/visuals/ambient-bouncer"

export function LandingPage() {
  // (featureHighlights removed because it was unused)

  const benefits = [
    {
      Icon: Zap,
      title: "Configuración instantánea",
      description: "Crea salas en segundos, sin configuraciones complejas",
    },
    {
      Icon: Shield,
      title: "Seguro y privado",
      description: "Tus conversaciones están protegidas con encriptación de extremo a extremo",
    },
    {
      Icon: Clock,
      title: "Tiempo real",
      description: "Comunicación instantánea mientras estés conectado a la sala",
    },
  ]

  return (
    <div className="relative isolate h-full overflow-hidden">
      <AmbientBouncer count={14} />
      
      {/* Hero Section */}
      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-16 overflow-hidden rounded-3xl border bg-background/80 backdrop-blur-sm px-6 py-20 text-center shadow-2xl shadow-border/20 sm:px-10">
        <div className="relative flex flex-col items-center gap-12">
          {/* Hero Header */}
          <div className="space-y-8">
            <div className="flex justify-center">
              <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
                <Sparkles className="mr-2 h-4 w-4" />
                Plataforma colaborativa de nueva generación
              </Badge>
            </div>
            <h1 className="text-6xl font-black tracking-tight text-foreground sm:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-r from-primary via-sky-500 to-primary bg-clip-text text-transparent">
                OnLinex
              </span>
            </h1>
            <p className="mx-auto max-w-4xl text-xl text-muted-foreground sm:text-2xl lg:text-xl leading-relaxed">
              Lanza salas colaborativas, invita a tu equipo en segundos o conversa con nuestra IA
              integrada. Todo desde una única plataforma diseñada para flujos en tiempo real.
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2">
            <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-xl">Gestiona tu equipo</CardTitle>
                    <CardDescription>
                      Crea o únete a una sala en segundos y coordina cada paso con tu equipo.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full h-11 group-hover:bg-primary/90 transition-colors">
                  <Link to="/rooms/create">
                    Crear una sala
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-11">
                  <Link to="/rooms/join">Unirme a una sala</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-2 transition-all hover:border-primary/50 hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-xl">Habla con la IA</CardTitle>
                    <CardDescription>
                      Consulta ideas, refina mensajes o automatiza tareas con nuestro agente listo 24/7.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full h-11 group-hover:bg-accent transition-colors">
                  <Link to="/ai">
                    Hablar con la IA
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Benefits Section */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">¿Por qué elegir OnLinex?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre las ventajas que hacen de OnLinex la mejor opción para tu equipo
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {benefits.map(({ Icon, title, description }) => (
              <Card key={title} className="text-center border-0 bg-muted/30 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


    </div>
  )
}
