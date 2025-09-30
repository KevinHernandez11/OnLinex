import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { RoomsDashboard } from "@/components/rooms/rooms-dashboard"

interface SessionData {
  token: string
  tokenType: string
}

function App() {
  const [session, setSession] = useState<SessionData | null>(null)

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token")
    if (!accessToken) {
      return
    }
    const tokenType = localStorage.getItem("token_type") ?? "bearer"
    setSession({ token: accessToken, tokenType })
  }, [])

  function handleLoginSuccess(token: string, tokenType: string) {
    setSession({ token, tokenType })
  }

  function handleLogout() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("token_type")
    setSession(null)
  }

  if (session) {
    return (
      <RoomsDashboard
        accessToken={session.token}
        tokenType={session.tokenType}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-10">
        <div className="flex w-full flex-col items-center gap-8">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Bienvenido a OnLinex
            </h1>
            <p className="text-muted-foreground">
              Crea tu cuenta o inicia sesion para continuar con la experiencia.
            </p>
          </div>
          <Card className="w-full max-w-lg">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-semibold">Tu cuenta</CardTitle>
              <CardDescription>
                Elige una opcion para acceder a todas nuestras funciones.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Iniciar sesion</TabsTrigger>
                  <TabsTrigger value="register">Registrarme</TabsTrigger>
                </TabsList>
                <TabsContent value="login" className="pt-6">
                  <LoginForm onLoginSuccess={handleLoginSuccess} />
                </TabsContent>
                <TabsContent value="register" className="pt-6">
                  <RegisterForm />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default App
