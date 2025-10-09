import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

interface AmbientBouncerProps {
  count?: number
  className?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

const LIGHT_COLORS = ["rgba(56, 189, 248, 0.75)", "rgba(59, 130, 246, 0.7)", "rgba(125, 211, 252, 0.65)"]

export function AmbientBouncer({ count = 10, className }: AmbientBouncerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext("2d")
    if (!context) {
      return
    }

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight

      sizeRef.current = { width, height, dpr }

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.scale(dpr, dpr)
    }

    const createParticles = () => {
      const particles: Particle[] = []
      for (let index = 0; index < count; index += 1) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() * 0.7 + 0.3) * (Math.random() > 0.5 ? 1 : -1),
          vy: (Math.random() * 0.7 + 0.3) * (Math.random() > 0.5 ? 1 : -1),
          radius: Math.random() * 3 + 1.5,
          color: LIGHT_COLORS[index % LIGHT_COLORS.length],
        })
      }
      particlesRef.current = particles
    }

    const draw = () => {
      const { width, height } = sizeRef.current
      context.clearRect(0, 0, width, height)
      const particles = particlesRef.current
      context.shadowBlur = 0
      context.shadowColor = "transparent"

      for (const particle of particles) {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x <= particle.radius || particle.x >= width - particle.radius) {
          particle.vx *= -1
          particle.x = Math.min(Math.max(particle.x, particle.radius), width - particle.radius)
        }

        if (particle.y <= particle.radius || particle.y >= height - particle.radius) {
          particle.vy *= -1
          particle.y = Math.min(Math.max(particle.y, particle.radius), height - particle.radius)
        }

        context.beginPath()
        context.fillStyle = particle.color
        context.shadowBlur = 8
        context.shadowColor = particle.color
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        context.fill()
      }

      animationRef.current = window.requestAnimationFrame(draw)
    }

    setCanvasSize()
    createParticles()
    draw()

    const handleResize = () => {
      setCanvasSize()
      createParticles()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener("resize", handleResize)
      context.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className={cn("pointer-events-none fixed inset-0 -z-10 h-full w-full", className)}
    />
  )
}
