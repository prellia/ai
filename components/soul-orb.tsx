"use client"

import { useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface SoulOrbProps {
  mood: "neutral" | "happy" | "thinking" | "speaking"
  energy: number
  isListening: boolean
  isSpeaking: boolean
}

export default function SoulOrb({ mood, energy, isListening, isSpeaking }: SoulOrbProps) {
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
      if (particles.length < 100) {
        const centerX = canvas.width / 4 // Divide by 4 because we scaled by 2
        const centerY = canvas.height / 4
        const radius = Math.min(centerX, centerY) * 0.8

        // Create particles based on mood
        let particleCount = 1
        let baseColor = "rgba(100, 100, 255, "
        let speedFactor = 0.5
        let sizeFactor = 1

        if (mood === "thinking") {
          particleCount = 2 + Math.floor(energy * 3)
          baseColor = "rgba(100, 150, 255, "
          speedFactor = 0.8 + energy * 0.5
          sizeFactor = 1 + energy * 0.5
        } else if (mood === "speaking") {
          particleCount = 2
          baseColor = "rgba(180, 100, 255, "
          speedFactor = 1
          sizeFactor = 1.2
        } else if (mood === "happy") {
          particleCount = 3
          baseColor = "rgba(150, 200, 255, "
          speedFactor = 1.2
          sizeFactor = 1.3
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
          const opacity = Math.random() * 0.5 + 0.2

          // Random life span
          const maxLife = Math.random() * 100 + 50

          particles.push({
            x,
            y,
            radius: particleRadius,
            color: `${baseColor}${opacity})`,
            vx,
            vy,
            life: 0,
            maxLife,
          })
        }
      }
    }

    const animate = () => {
      if (!canvas || !ctx) return

      // Clear canvas with a slight fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
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
        const opacity = lifeRatio * 0.8

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = particle.color.replace(/\d+\.?\d*\)$/, `${opacity})`)
        ctx.fill()

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
          primary: "from-blue-400 to-cyan-600",
          glow: "rgba(56, 189, 248, 0.5)",
          border: "border-blue-400/30",
        }
      case "thinking":
        return {
          primary: "from-blue-500 to-indigo-700",
          glow: "rgba(99, 102, 241, 0.5)",
          border: "border-indigo-400/30",
        }
      case "speaking":
        return {
          primary: "from-purple-500 to-fuchsia-700",
          glow: "rgba(192, 38, 211, 0.5)",
          border: "border-purple-400/30",
        }
      default:
        return {
          primary: "from-indigo-600 to-blue-800",
          glow: "rgba(79, 70, 229, 0.3)",
          border: "border-indigo-500/20",
        }
    }
  }

  const colors = getMoodColors()

  return (
    <motion.div
      className="relative w-64 h-64 flex items-center justify-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {/* Ambient glow */}
      <motion.div
        className={cn("absolute w-full h-full rounded-full blur-3xl opacity-20 bg-gradient-to-br", colors.primary)}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Outer ring */}
      <motion.div
        className={cn("absolute w-56 h-56 rounded-full border backdrop-blur-sm", colors.border)}
        animate={{
          scale: isListening || isSpeaking ? [1, 1.03, 1] : [1, 1.01, 1],
          opacity: isListening || isSpeaking ? [0.6, 0.8, 0.6] : [0.4, 0.5, 0.4],
          rotate: [0, 360],
        }}
        transition={{
          scale: {
            duration: isListening || isSpeaking ? 2 : 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          opacity: {
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          rotate: {
            duration: 60,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          },
        }}
      />

      {/* Middle ring with particles */}
      <motion.div
        className={cn("absolute w-48 h-48 rounded-full border backdrop-blur-sm", colors.border)}
        animate={{
          scale: isListening || isSpeaking ? [1, 1.05, 1] : [1, 1.02, 1],
          opacity: isListening || isSpeaking ? [0.5, 0.7, 0.5] : [0.3, 0.4, 0.3],
          rotate: [360, 0],
        }}
        transition={{
          scale: {
            duration: isListening || isSpeaking ? 3 : 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          opacity: {
            duration: 4,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          rotate: {
            duration: 80,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
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
          boxShadow: `0 0 30px 5px ${colors.glow}`,
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
