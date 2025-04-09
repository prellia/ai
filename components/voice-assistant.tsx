"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import CosmicSoulOrb from "./cosmic-soul-orb"

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    SpeechSynthesisUtterance: any
  }
}

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [response, setResponse] = useState("")
  const [energy, setEnergy] = useState(0)
  const [mood, setMood] = useState<"neutral" | "happy" | "thinking" | "speaking">("neutral")

  const recognitionRef = useRef<any>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex
        const result = event.results[current]
        const transcriptText = result[0].transcript

        setTranscript(transcriptText)

        if (result.isFinal) {
          handleCommand(transcriptText)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error", event.error)
        setIsListening(false)
        setMood("neutral")
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Update mood based on state
  useEffect(() => {
    if (isListening) {
      setMood("thinking")
      setupAudioVisualization()
    } else if (isSpeaking) {
      setMood("speaking")
    } else {
      setMood("neutral")
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      setEnergy(0)
    }
  }, [isListening, isSpeaking])

  const setupAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()

      analyser.fftSize = 256
      source.connect(analyser)

      analyserRef.current = analyser
      const bufferLength = analyser.frequencyBinCount
      dataArrayRef.current = new Uint8Array(bufferLength)

      const updateEnergy = () => {
        if (!isListening) return

        analyser.getByteFrequencyData(dataArrayRef.current!)

        // Calculate average energy
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArrayRef.current![i]
        }
        const avg = sum / bufferLength
        const normalizedEnergy = Math.min(1, avg / 128)

        setEnergy(normalizedEnergy)
        animationFrameRef.current = requestAnimationFrame(updateEnergy)
      }

      updateEnergy()
    } catch (error) {
      console.error("Error accessing microphone", error)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsListening(false)
    } else {
      setTranscript("")
      if (recognitionRef.current) {
        recognitionRef.current.start()
      }
      setIsListening(true)
    }
  }

  const handleCommand = (command: string) => {
    const lowerCommand = command.toLowerCase().trim()

    // Simple command handling
    let responseText = ""

    if (lowerCommand.includes("hello") || lowerCommand.includes("hi")) {
      responseText = "Hello! How can I help you today?"
      setMood("happy")
    } else if (lowerCommand.includes("time")) {
      const now = new Date()
      responseText = `The current time is ${now.toLocaleTimeString()}.`
    } else if (lowerCommand.includes("date")) {
      const now = new Date()
      responseText = `Today is ${now.toLocaleDateString()}.`
    } else if (lowerCommand.includes("weather")) {
      responseText = "I'm sorry, I don't have access to weather information at the moment."
    } else if (lowerCommand.includes("thank")) {
      responseText = "You're welcome! Is there anything else I can help with?"
      setMood("happy")
    } else if (lowerCommand.includes("bye") || lowerCommand.includes("goodbye")) {
      responseText = "Goodbye! Have a great day!"
      setMood("happy")
    } else {
      responseText = "I'm not sure how to respond to that. Can you try asking something else?"
    }

    setResponse(responseText)
    speakResponse(responseText)
  }

  const speakResponse = (text: string) => {
    if ("speechSynthesis" in window) {
      setIsSpeaking(true)

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = () => {
        setIsSpeaking(false)
        setMood("neutral")
      }

      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full" ref={containerRef}>
      {/* Cosmic Background */}
      <div className="fixed inset-0 bg-[#050508]">
        {/* Deep space gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-[#0a0a1a] via-[#050508] to-black" />

        {/* Nebula effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />
        </div>

        {/* Stars */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(150)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + (i % 20 === 0 ? 2 : 1) + "px",
                height: Math.random() * 2 + (i % 20 === 0 ? 2 : 1) + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                opacity: Math.random() * 0.7 + 0.3,
              }}
              animate={{
                opacity: [Math.random() * 0.5 + 0.3, Math.random() * 0.8 + 0.5, Math.random() * 0.5 + 0.3],
                scale: i % 10 === 0 ? [1, 1.3, 1] : 1,
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: Math.random() * 5,
              }}
            />
          ))}
        </div>

        {/* Distant galaxies */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`galaxy-${i}`}
            className="absolute rounded-full opacity-20 blur-xl"
            style={{
              width: Math.random() * 300 + 100 + "px",
              height: Math.random() * 300 + 100 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              background:
                i % 2 === 0
                  ? "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(30, 27, 75, 0) 70%)"
                  : "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(30, 27, 75, 0) 70%)",
              transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
            }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.1, 1],
              rotate: [`${Math.random() * 360}deg`, `${Math.random() * 360 + 20}deg`],
            }}
            transition={{
              duration: 20 + i * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-screen-sm mx-auto px-4">
        {/* Soul Orb */}
        <div className="mb-16 cursor-pointer" onClick={toggleListening}>
          <CosmicSoulOrb mood={mood} energy={energy} isListening={isListening} isSpeaking={isSpeaking} />
        </div>

        {/* Status text */}
        <motion.div
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.p
            className={cn(
              "text-sm font-light tracking-wider",
              isListening ? "text-cyan-300" : isSpeaking ? "text-fuchsia-300" : "text-slate-400",
            )}
            animate={{
              opacity: isListening || isSpeaking ? [0.8, 1, 0.8] : 0.7,
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Tap to speak"}
          </motion.p>
        </motion.div>

        {/* Text display */}
        <motion.div className="w-full max-w-md mx-auto mb-12" layout>
          <AnimatePresence mode="wait">
            {transcript && isListening ? (
              <motion.div
                key="transcript"
                className="relative p-5 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-cyan-500/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-900/10 to-transparent" />
                <p className="text-cyan-100/90 text-sm font-light relative z-10">{transcript}</p>
              </motion.div>
            ) : response ? (
              <motion.div
                key="response"
                className="relative p-6 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-fuchsia-500/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-fuchsia-900/10 to-transparent" />
                <p className="text-fuchsia-50 text-lg font-light relative z-10">{response}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        {/* Help text */}
        <motion.div
          className="text-slate-500 text-xs font-light tracking-wide text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>Try saying: "Hello", "What time is it?", "What's the date today?"</p>
        </motion.div>
      </div>
    </div>
  )
}
