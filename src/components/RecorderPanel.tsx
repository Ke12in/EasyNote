import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react'

interface RecorderPanelProps {
  isRecording: boolean
  setIsRecording: (v: boolean) => void
  recordingSeconds: number
  setRecordingSeconds: (n: number) => void
  transcript: string
  setTranscript: (s: string) => void
  onSnapshot: (dataUrl: string, label: string) => void
}

export const RecorderPanel = forwardRef<
  {
    addSnapshot: (dataUrl: string, label: string) => void
    getTranscript: () => string
    stop: () => void
  },
  RecorderPanelProps
>(function RecorderPanel(
  {
    isRecording,
    setIsRecording,
    recordingSeconds,
    setRecordingSeconds,
    transcript,
    setTranscript,
    onSnapshot,
  },
  ref
) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [recordingMode, setRecordingMode] = useState<'audio' | 'screen' | 'voice'>('audio')
  const [error, setError] = useState('')
  const [permission, setPermission] = useState<'idle' | 'granted' | 'denied'>('idle')

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (_) {}
      recognitionRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setIsRecording(false)
  }, [setIsRecording])

  const captureFrame = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !video.srcObject) return
    const stream = video.srcObject as MediaStream
    const track = stream.getVideoTracks()[0]
    if (!track) return
    const { width = 1280, height = 720 } = track.getSettings()
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    return dataUrl
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      addSnapshot(dataUrl: string, label: string) {
        const url = dataUrl || captureFrame()
        if (url) onSnapshot(url, label || `At ${Math.floor(recordingSeconds / 60)}:${String(recordingSeconds % 60).padStart(2, '0')}`)
      },
      getTranscript: () => transcript,
      stop: stopRecording,
    }),
    [captureFrame, onSnapshot, recordingSeconds, transcript, stopRecording]
  )

  useEffect(() => {
    if (!isRecording) return
    timerRef.current = setInterval(() => {
      setRecordingSeconds((s) => s + 1)
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording, setRecordingSeconds])

  const startRecording = async () => {
    setError('')
    try {
      let stream: MediaStream
      const voiceOnly = recordingMode === 'voice'
      if (recordingMode === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
      } else if (voiceOnly) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      }
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = voiceOnly ? null : stream
      }

      const audioMime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : ''
      const videoMime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm'
      const isAudioOnly = voiceOnly
      const mimeType = isAudioOnly && audioMime ? audioMime : videoMime
      const options: MediaRecorderOptions = {
        audioBitsPerSecond: 128000,
      }
      if (isAudioOnly) {
        options.mimeType = audioMime || undefined
      } else {
        options.mimeType = mimeType
        options.videoBitsPerSecond = 2500000
      }

      const recorder = new MediaRecorder(stream, options)
      const chunks: Blob[] = []
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data)
      }
      recorder.onstop = () => {
        const type = isAudioOnly ? (audioMime || 'audio/webm') : 'video/webm'
        const ext = type.startsWith('audio/') ? 'webm' : 'webm'
        const blob = new Blob(chunks, { type })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `session-${Date.now()}.${ext}`
        a.click()
        URL.revokeObjectURL(url)
      }
      recorder.start(1000)
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setPermission('granted')

      const SpeechRecognitionAPI =
        (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let final = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            final += event.results[i][0].transcript
          }
          if (event.results[event.results.length - 1].isFinal) {
            setTranscript((t) => (t ? t + ' ' + final : final))
          }
        }
        recognition.start()
        recognitionRef.current = recognition
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start recording')
      setPermission('denied')
    }
  }

  const handleStop = () => {
    stopRecording()
  }

  const takeSnapshot = () => {
    const dataUrl = captureFrame()
    if (dataUrl) onSnapshot(dataUrl, `At ${Math.floor(recordingSeconds / 60)}:${String(recordingSeconds % 60).padStart(2, '0')}`)
  }

  return (
    <div className="space-y-4">
      {!isRecording && (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="text-zinc-400 text-sm">Record:</span>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 sm:items-center">
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-0 py-1">
              <input
                type="radio"
                name="mode"
                checked={recordingMode === 'audio'}
                onChange={() => setRecordingMode('audio')}
                className="rounded-full border-zinc-600 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-sm">Microphone + Camera</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-0 py-1">
              <input
                type="radio"
                name="mode"
                checked={recordingMode === 'voice'}
                onChange={() => setRecordingMode('voice')}
                className="rounded-full border-zinc-600 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-sm">Voice only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer min-h-[44px] sm:min-h-0 py-1">
              <input
                type="radio"
                name="mode"
                checked={recordingMode === 'screen'}
                onChange={() => setRecordingMode('screen')}
                className="rounded-full border-zinc-600 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="text-sm">Screen + Mic</span>
            </label>
          </div>
        </div>
      )}

      <div className="relative rounded-xl overflow-hidden bg-black border border-zinc-800 aspect-video max-h-[40vh] sm:max-h-[400px] w-full">
        {recordingMode === 'voice' && isRecording ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400">
            <span className="text-4xl">🎙️</span>
            <span className="text-sm font-medium">Voice recording</span>
            <span className="text-xs">Microphone only — no camera</span>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
        {isRecording && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-600/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')}
          </div>
        )}
        {isRecording && (
          <div className="absolute bottom-2 right-2 left-2 sm:left-auto flex flex-wrap gap-2 justify-end">
            {recordingMode !== 'voice' && (
              <button
                onClick={takeSnapshot}
                className="px-4 py-2.5 min-h-[44px] sm:min-h-0 bg-white/90 text-black rounded-lg text-sm font-medium hover:bg-white active:bg-white"
              >
                📷 Snapshot
              </button>
            )}
            <button
              onClick={handleStop}
              className="px-4 py-2.5 min-h-[44px] sm:min-h-0 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-500 active:bg-red-500"
            >
              Stop
            </button>
          </div>
        )}
      </div>

      {!isRecording && (
        <button
          onClick={startRecording}
          disabled={permission === 'denied'}
          className="w-full sm:w-auto px-6 py-3 min-h-[48px] bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 active:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start recording
        </button>
      )}

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <div className="rounded-xl bg-zinc-900/80 border border-zinc-800 p-3 sm:p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-2">Live transcript</h3>
        <div className="min-h-[100px] max-h-[25vh] sm:max-h-[200px] overflow-y-auto text-sm text-zinc-300 whitespace-pre-wrap">
          {transcript || '(Start recording to capture what’s said. Use Chrome for best support.)'}
        </div>
      </div>
    </div>
  )
})
