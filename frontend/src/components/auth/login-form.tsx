import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, User, Lock } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es obligatorio"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
})

type LoginFormValues = z.infer<typeof loginSchema>

const API_BASE_URL = import.meta.env.VITE_API_URL ?? ""

interface LoginFormProps {
  onLoginSuccess?: (token: string, tokenType: string) => void
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: values.username,
          password: values.password,
        }),
      })

      const data = (await response.json().catch(() => null)) as
        | { access_token?: string; token_type?: string; detail?: string; message?: string }
        | null

      if (!response.ok) {
        const message =
          data?.detail ?? data?.message ?? "No pudimos iniciar tu sesion."
        form.setError("root", { message })
        return
      }

      if (!data?.access_token) {
        form.setError("root", {
          message: data?.detail ?? "No se recibio el token de acceso.",
        })
        return
      }

      const tokenType = data.token_type ?? "bearer"
      form.reset()
      onLoginSuccess?.(data.access_token, tokenType)
    } catch (error) {
      form.setError("root", {
        message: "Ocurrio un error inesperado. Intenta mas tarde.",
      })
      console.error("Login error", error)
    }
  }

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = form

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {errors.root?.message ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">
                Error
              </Badge>
              <p className="text-sm text-destructive">{errors.root.message}</p>
            </div>
          </div>
        ) : null}
        
        <FormField
          control={control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Username</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="nombre de usuario"
                    autoComplete="username"
                    className="pl-10 h-11"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    autoComplete="current-password"
                    className="pl-10 pr-10 h-11"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </form>
    </Form>
  )
}
