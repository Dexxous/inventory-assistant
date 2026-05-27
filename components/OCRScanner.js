'use client'

import { useState, useRef } from 'react'
import { Camera, X, RotateCcw } from 'lucide-react'

export default function OCRScanner({ onResult }) {
  const [active, setActive] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const canvasRef = useRef(null)

  const startCamera = async () => {
    setError(null)
    setPreview(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setActive(true)
    } catch (err) {
      setError('Kamera není dostupná. Zkontrolujte oprávnění nebo použijte HTTPS.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setActive(false)
    setPreview(null)
    setError(null)
  }

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current) return
    setProcessing(true)
    setError(null)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)

    // Preprocessing — zvýšení kontrastu pro lepší OCR
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      const val = avg > 128 ? 255 : 0
      data[i] = val
      data[i + 1] = val
      data[i + 2] = val
    }
    ctx.putImageData(imageData, 0, 0)

    const imageUrl = canvas.toDataURL('image/png')
    setPreview(imageUrl)

    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng')
      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_/',
      })
      const { data: { text } } = await worker.recognize(imageUrl)
      await worker.terminate()

      // Extrakce SN — hledáme řetězce které vypadají jako sériová čísla
      const cleaned = text.replace(/\s+/g, ' ').trim()
      const snPatterns = cleaned.match(/[A-Z0-9]{4,}[-_/]?[A-Z0-9]*/g) ?? []
      const bestMatch = snPatterns
        .filter(s => s.length >= 4)
        .sort((a, b) => b.length - a.length)[0]

      if (bestMatch) {
        stopCamera()
        onResult(bestMatch)
      } else {
        setError('Sériové číslo nebylo rozpoznáno. Zkuste znovu.')
        setProcessing(false)
      }
    } catch (err) {
      setError('Chyba při zpracování. Zkuste znovu.')
      setProcessing(false)
    }
  }

  const retake = () => {
    setPreview(null)
    setError(null)
    setProcessing(false)
  }

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />

      {!active ? (
        <button
          onClick={startCamera}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-700 text-white py-3 rounded-lg text-sm font-semibold transition-all"
        >
          <Camera size={16} />
          Skenovat štítek (OCR)
        </button>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {!preview ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full rounded-t-xl"
                style={{ maxHeight: '260px', objectFit: 'cover' }}
              />
              {/* Zaměřovací rámeček */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-white rounded-lg w-3/4 h-16 opacity-70" />
              </div>
              <p className="text-xs text-center text-gray-400 py-2 px-4">
                Namiřte kameru na štítek se sériovým číslem
              </p>
              <div className="flex gap-2 p-3">
                <button
                  onClick={captureAndProcess}
                  disabled={processing}
                  className="flex-1 bg-[#0073E6] text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                  {processing ? 'Zpracovávám...' : 'Vyfotit a rozpoznat'}
                </button>
                <button
                  onClick={stopCamera}
                  className="px-3 py-3 rounded-lg border border-gray-200 text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <img src={preview} alt="Náhled" className="w-full rounded-t-xl" style={{ maxHeight: '200px', objectFit: 'cover' }} />
              {error && (
                <div className="px-4 py-3">
                  <p className="text-sm text-red-500 mb-2">{error}</p>
                  <button
                    onClick={retake}
                    className="flex items-center gap-2 text-sm text-[#0073E6] font-medium"
                  >
                    <RotateCcw size={14} />
                    Zkusit znovu
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}