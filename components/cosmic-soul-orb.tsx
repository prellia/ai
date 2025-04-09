"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CosmicSoulOrbProps {
  mood: "neutral" | "happy" | "thinking" | "speaking"
  energy: number
  isListening: boolean
  isSpeaking: boolean
}

export default function CosmicSoulOrb({ mood, energy, isListening, isSpeaking }: CosmicSoulOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const orbRef = useRef<HTMLDivElement>(null)

  // Canvas animation for fluid effect
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let particles: Array<{
      x: number
      y: number
      radius: number
      color: string
      vx: number
      vy: number
      life: number
      maxLife: number
      opacity: number
      hue: number
    }> = []

    const resizeCanvas = () => {
      if (canvas && orbRef.current) {
        const rect = orbRef.current.getBoundingClientRect()
        canvas.width = rect.width * 2 // For higher resolution
        canvas.height = rect.height * 2
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`
        ctx.scale(2, 2) // Scale for higher resolution
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Create particles based on mood
    const createParticles = () => {
      // Only create new particles if we have less than the max
      if (particles.length < 150) {
        const centerX = canvas.width / 4 // Divide by 4 because we scaled by 2
        const centerY = canvas.height / 4
        const radius = Math.min(centerX, centerY) * 0.8

        // Create particles based on mood
        let particleCount = 1
        let baseHue = 220 // Blue
        let speedFactor = 0.5
        let sizeFactor = 1
        let opacityFactor = 0.6

        if (mood === "thinking") {
          particleCount = 2 + Math.floor(energy * 3)
          baseHue = 180 // Cyan
          speedFactor = 0.8 + energy * 0.5
          sizeFactor = 1 + energy * 0.5
          opacityFactor = 0.7 + energy * 0.2
        } else if (mood === "speaking") {
          particleCount = 2
          baseHue = 280 // Purple
          speedFactor = 1
          sizeFactor = 1.2
          opacityFactor = 0.8
        } else if (mood === "happy") {
          particleCount = 3
          baseHue = 200 // Light blue
          speedFactor = 1.2
          sizeFactor = 1.3
          opacityFactor = 0.9
        }

        for (let i = 0; i < particleCount; i++) {
          // Create particles at random angles from the center
          const angle = Math.random() * Math.PI * 2
          const distance = Math.random() * radius * 0.8

          // Calculate position based on angle and distance
          const x = centerX + Math.cos(angle) * distance
          const y = centerY + Math.sin(angle) * distance

          // Random velocity based on mood
          const vx = (Math.random() - 0.5) * speedFactor
          const vy = (Math.random() - 0.5) * speedFactor

          // Random size based on mood
          const particleRadius = (Math.random() * 3 + 1) * sizeFactor

          // Random opacity
          const opacity = (Math.random() * 0.5 + 0.3) * opacityFactor

          // Random hue variation
          const hue = baseHue + Math.random() * 30 - 15

          // Random life span
          const maxLife = Math.random() * 100 + 50

          particles.push({
            x,
            y,
            radius: particleRadius,
            color: `hsla(${hue}, 100%, 70%, ${opacity})`,
            vx,
            vy,
            life: 0,
            maxLife,
            opacity,
            hue,
          })
        }
      }
    }

    const animate = () => {
      if (!canvas || !ctx) return

      // Clear canvas with a slight fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)"
      ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2)

      // Create new particles
      createParticles()

      // Update and draw particles
      particles = particles.filter((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Increase life
        particle.life++

        // Calculate opacity based on life
        const lifeRatio = 1 - particle.life / particle.maxLife
        const opacity = lifeRatio * particle.opacity

        // Draw particle with glow effect
        ctx.save()
        ctx.globalCompositeOperation = "screen"

        // Glow effect
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 2,
        )
        gradient.addColorStop(0, `hsla(${particle.hue}, 100%, 70%, ${opacity})`)
        gradient.addColorStop(1, `hsla(${particle.hue}, 100%, 70%, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2)
        ctx.fill()

        // Core particle
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 90%, ${opacity * 1.5})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius * 0.7, 0, Math.PI * 2)
        ctx.fill()

        ctx.restore()

        // Keep particle if still alive
        return particle.life < particle.maxLife
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [mood, energy, isListening, isSpeaking])

  // Get colors based on mood
  const getMoodColors = () => {
    switch (mood) {
      case "happy":
        return {
          primary: "from-cyan-400 to-blue-600",
          glow: "rgba(6, 182, 212, 0.6)",
          border: "border-cyan-500/30",
          ring: "border-cyan-400/20",
        }
      case "thinking":
        return {
          primary: "from-cyan-500 to-blue-700",
          glow: "rgba(14, 165, 233, 0.6)",
          border: "border-cyan-500/30",
          ring: "border-cyan-400/20",
        }
      case "speaking":
        return {
          primary: "from-fuchsia-500 to-purple-700",
          glow: "rgba(192, 38, 211, 0.6)",
          border: "border-fuchsia-500/30",
          ring: "border-fuchsia-400/20",
        }
      default:
        return {
          primary: "from-blue-600 to-indigo-800",
          glow: "rgba(79, 70, 229, 0.4)",
          border: "border-blue-500/20",
          ring: "border-blue-400/10",
        }
    }
  }

  const colors = getMoodColors()

  return (
    <motion.div
      className="relative w-72 h-72 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Ambient glow */}
      <motion.div
        className={cn("absolute w-full h-full rounded-full blur-3xl opacity-30 bg-gradient-to-br", colors.primary)}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Outer cosmic ring */}
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: "linear-gradient(180deg, rgba(30, 41, 59, 0.2) 0%, rgba(15, 23, 42, 0.1) 100%)",
          boxShadow: `0 0 30px 5px ${colors.glow}`,
          border: `1px solid rgba(255, 255, 255, 0.05)`,
        }}
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 120,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {/* Constellation points on outer ring */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`const-${i}`}
            className="absolute w-1 h-1 rounded-full bg-white"
            style={{
              top: `${50 + 48 * Math.sin((i * Math.PI * 2) / 12)}%`,
              left: `${50 + 48 * Math.cos((i * Math.PI * 2) / 12)}%`,
            }}
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: i % 3 === 0 ? [1, 1.5, 1] : 1,
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      {/* Middle ring with cosmic dust */}
      <motion.div
        className={cn("absolute w-56 h-56 rounded-full backdrop-blur-sm", colors.ring)}
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.3) 0%, rgba(15, 23, 42, 0.1) 100%)",
        }}
        animate={{
          rotate: [360, 0],
        }}
        transition={{
          duration: 180,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {/* Cosmic dust particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`dust-${i}`}
            className="absolute rounded-full bg-white/70 blur-[0.5px]"
            style={{
              width: i % 3 === 0 ? "3px" : "2px",
              height: i % 3 === 0 ? "3px" : "2px",
              top: `${50 + 45 * Math.sin((i * Math.PI * 2) / 8)}%`,
              left: `${50 + 45 * Math.cos((i * Math.PI * 2) / 8)}%`,
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + (i % 3),
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        ))}
      </motion.div>

      {/* Inner ring */}
      <motion.div
        className={cn("absolute w-48 h-48 rounded-full", colors.ring)}
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.2) 100%)",
          boxShadow: `inset 0 0 20px 5px rgba(0, 0, 0, 0.3)`,
        }}
        animate={{
          rotate: [0, 360],
          scale: isListening || isSpeaking ? [1, 1.03, 1] : [1, 1.01, 1],
        }}
        transition={{
          rotate: {
            duration: 150,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
          scale: {
            duration: isListening || isSpeaking ? 2 : 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
        }}
      />

      {/* Core orb */}
      <motion.div
        ref={orbRef}
        className={cn(
          "relative w-40 h-40 rounded-full flex items-center justify-center overflow-hidden",
          "backdrop-blur-md border border-white/10",
          "bg-gradient-to-b",
          colors.primary,
        )}
        style={{
          boxShadow: `0 0 40px 10px ${colors.glow}, inset 0 0 20px 5px rgba(0, 0, 0, 0.5)`,
        }}
        animate={{
          scale: isListening ? [1, 1 + energy * 0.05, 1] : isSpeaking ? [1, 1.03, 1] : [1, 1.02, 1],
        }}
        transition={{
          duration: isListening ? 0.3 : isSpeaking ? 0.5 : 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {/* Canvas for fluid particle effect */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full rounded-full"
          style={{ mixBlendMode: "screen" }}
        />

        {/* Inner glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Core energy */}
        <motion.div
          className={cn(
            "absolute w-24 h-24 rounded-full bg-gradient-to-br from-white/80 to-white/40 blur-sm",
            isListening ? "mix-blend-overlay" : "mix-blend-soft-light",
          )}
          animate={{
            scale: isListening ? [0.8, 1 + energy * 0.3, 0.8] : isSpeaking ? [0.8, 1.1, 0.8] : [0.8, 0.9, 0.8],
            opacity: isListening ? [0.6, 0.8, 0.6] : isSpeaking ? [0.6, 0.7, 0.6] : [0.5, 0.6, 0.5],
          }}
          transition={{
            scale: {
              duration: isListening ? 0.5 : isSpeaking ? 1 : 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            opacity: {
              duration: isListening ? 0.5 : isSpeaking ? 1 : 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        />

        {/* Mood-based inner patterns */}
        {mood === "happy" && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`happy-${i}`}
                className="absolute w-32 h-32 rounded-full border border-white/20"
                style={{
                  transform: `rotate(${i * 36}deg)`,
                }}
                animate={{
                  rotate: [0, 360],
                  scale: [0.8, 1, 0.8],
                }}
                transition={{
                  rotate: {
                    duration: 20 + i * 5,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  },
                  scale: {
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  },
                }}
              />
            ))}
          </div>
        )}

        {mood === "thinking" && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <motion.div
              className="absolute w-full h-[40%] bg-white/10 blur-md"
              animate={{
                y: [-20, 0, 20, 0, -20],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                y: {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
                opacity: {
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                },
              }}
            />
          </div>
        )}

        {mood === "speaking" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-end justify-center gap-1 h-12">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`eq-${i}`}
                  className="w-1.5 bg-white/70 rounded-full"
                  animate={{
                    height: [4, 12 + i * 2, 4, 16 + i * 1.5, 4],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    height: {
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: i * 0.1,
                    },
                    opacity: {
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Pulse rings */}
      <AnimatePresence>
        {(isListening || isSpeaking) && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`pulse-${i}`}
                className={cn("absolute inset-0 rounded-full border", colors.border)}
                initial={{ scale: 0.8, opacity: 0.7 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.6,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Floating particles around orb */}
      <div className="absolute inset-0 overflow-visible">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-white/70 w-1 h-1 blur-[0.5px]"
            style={{
              left: `${50 + 45 * Math.cos((i * (Math.PI * 2)) / 12)}%`,
              top: `${50 + 45 * Math.sin((i * (Math.PI * 2)) / 12)}%`,
            }}
            animate={{
              x: [0, Math.random() * 20 - 10, 0],
              y: [0, Math.random() * 20 - 10, 0],
              scale: [1, Math.random() * 0.5 + 0.8, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: 3 + (i % 4),
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
