'use client'

import { useState } from 'react'
import { FileDown } from 'lucide-react'

export default function PDFExport({ data }) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)

    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    // Načtení Atos loga jako base64
    const logoUrl = '/atos-logo.svg'
    const logoRes = await fetch(logoUrl)
    const logoText = await logoRes.text()
    const logoBase64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(logoText)))

    const date = new Date().toLocaleDateString('cs-CZ')
    const percent = data.summary.total > 0
      ? Math.round((data.summary.found / data.summary.total) * 100)
      : 0

    // Pomocná funkce pro diakritiku
    const t = (str) => str
      .replace(/á/g, 'a').replace(/Á/g, 'A')
      .replace(/č/g, 'c').replace(/Č/g, 'C')
      .replace(/ď/g, 'd').replace(/Ď/g, 'D')
      .replace(/é/g, 'e').replace(/É/g, 'E')
      .replace(/ě/g, 'e').replace(/Ě/g, 'E')
      .replace(/í/g, 'i').replace(/Í/g, 'I')
      .replace(/ň/g, 'n').replace(/Ň/g, 'N')
      .replace(/ó/g, 'o').replace(/Ó/g, 'O')
      .replace(/ř/g, 'r').replace(/Ř/g, 'R')
      .replace(/š/g, 's').replace(/Š/g, 'S')
      .replace(/ť/g, 't').replace(/Ť/g, 'T')
      .replace(/ú/g, 'u').replace(/ů/g, 'u').replace(/Ú/g, 'U').replace(/Ů/g, 'U')
      .replace(/ý/g, 'y').replace(/Ý/g, 'Y')
      .replace(/ž/g, 'z').replace(/Ž/g, 'Z')

    // ─── HLAVIČKA ───────────────────────────────────────────
    doc.setFillColor(0, 115, 230)
    doc.rect(0, 0, 210, 36, 'F')

    // Logo
    doc.addImage(logoBase64, 'SVG', 12, 8, 36, 12)

    // Název dokumentu
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('INVENTORY ASSISTANT', 12, 28)

    // Název inventury vpravo
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(t(data.session.name), 210 - 12, 16, { align: 'right' })
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 215, 255)
    doc.text(`Datum: ${date}  |  Faze ${data.session.phase}`, 210 - 12, 23, { align: 'right' })

    // ─── SOUHRNNÉ STATISTIKY ────────────────────────────────
    let y = 46

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Celkovy prehled', 12, y)
    y += 6

    // 6 barevných karet statistik
    const stats = [
      { label: 'Celkem', value: data.summary.total, color: [30, 30, 30] },
      { label: 'Nalezeno', value: data.summary.found, color: [16, 120, 80] },
      { label: 'Chybi', value: data.summary.missing, color: [180, 30, 30] },
      { label: 'Nova', value: data.summary.new, color: [0, 115, 230] },
      { label: 'Nenaskenovano', value: data.summary.unscanned, color: [120, 120, 120] },
      { label: 'Dokonceno', value: `${percent}%`, color: [30, 30, 30] },
    ]

    const cardW = 29
    const cardH = 18
    const cardGap = 3
    const startX = 12

    stats.forEach((stat, i) => {
      const x = startX + i * (cardW + cardGap)
      doc.setFillColor(248, 249, 251)
      doc.setDrawColor(220, 220, 220)
      doc.roundedRect(x, y, cardW, cardH, 2, 2, 'FD')

      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...stat.color)
      doc.text(String(stat.value), x + cardW / 2, y + 10, { align: 'center' })

      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 120, 120)
      doc.text(stat.label.toUpperCase(), x + cardW / 2, y + 15, { align: 'center' })
    })

    y += cardH + 6

    // Progress bar
    doc.setFillColor(230, 230, 230)
    doc.roundedRect(12, y, 186, 5, 2, 2, 'F')
    if (percent > 0) {
      doc.setFillColor(16, 120, 80)
      doc.roundedRect(12, y, 186 * (percent / 100), 5, 2, 2, 'F')
    }
    doc.setFontSize(7)
    doc.setTextColor(120, 120, 120)
    doc.text(`Prubeh: ${data.summary.found} / ${data.summary.total} zarizeni (${percent}%)`, 12, y + 9)

    y += 16

    // ─── TABULKA PER TÝM ────────────────────────────────────
    if (data.byTeam?.length > 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Prehled per tym', 12, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [['Tym', 'Celkem', 'Nalezeno', 'Chybi', 'Dokonceno']],
        body: data.byTeam.map(team => [
          t(team.team || 'Bez tymu'),
          team.total,
          team.found,
          team.missing,
          `${team.total > 0 ? Math.round((team.found / team.total) * 100) : 0}%`
        ]),
        headStyles: {
          fillColor: [0, 115, 230],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: { fontSize: 9, halign: 'center' },
        columnStyles: { 0: { halign: 'left' } },
        alternateRowStyles: { fillColor: [248, 249, 251] },
        theme: 'grid',
        margin: { left: 12, right: 12 }
      })

      y = doc.lastAutoTable.finalY + 8
    }

    // ─── TABULKA PER UŽIVATEL ────────────────────────────────
    if (data.byUser?.length > 0) {
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Prehled per uzivatel', 12, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [['Uzivatel', 'Celkem', 'Nalezeno', 'Chybi', 'Dokonceno']],
        body: data.byUser.map(user => [
          t(user.user || 'Neprirazeno'),
          user.total,
          user.found,
          user.missing,
          `${user.total > 0 ? Math.round((user.found / user.total) * 100) : 0}%`
        ]),
        headStyles: {
          fillColor: [0, 115, 230],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center'
        },
        bodyStyles: { fontSize: 9, halign: 'center' },
        columnStyles: { 0: { halign: 'left' } },
        alternateRowStyles: { fillColor: [248, 249, 251] },
        theme: 'grid',
        margin: { left: 12, right: 12 }
      })
    }

    // ─── PATIČKA ────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setDrawColor(220, 220, 220)
      doc.line(12, 284, 198, 284)
      doc.setFontSize(7)
      doc.setTextColor(160, 160, 160)
      doc.setFont('helvetica', 'normal')
      doc.text('Atos SE — Interni dokument — Nepristupne verejnosti', 12, 289)
      doc.text(`Strana ${i} / ${pageCount}`, 198, 289, { align: 'right' })
    }

    doc.save(`report_${t(data.session.name).replace(/\s+/g, '_')}_${date.replace(/\./g, '-')}.pdf`)
    setExporting(false)
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 text-sm bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 font-medium"
    >
      <FileDown size={15} />
      {exporting ? 'Exportuji...' : 'Export PDF'}
    </button>
  )
}