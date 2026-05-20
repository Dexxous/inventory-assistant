'use client'

import { useEffect, useRef } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function Scanner({ onScan }) {
  const scannerRef = useRef(null)

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    })

    scanner.render(
      (decodedText) => {
        scanner.clear().catch(() => {})
        onScan(decodedText)
      },
      () => {}
    )

    scannerRef.current = scanner

    return () => {
      scanner.clear().catch(() => {})
    }
  }, [])

  return <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
}