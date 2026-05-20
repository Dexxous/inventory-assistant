import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import * as XLSX from 'xlsx'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const buffer = Buffer.from(await file.arrayBuffer())

  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  const preview = rows.slice(1, 4).map(row => ({
    inventoryNumber: row[0] ?? null,
    name: row[1] ?? 'Neznámé zařízení',
    serialNumber: String(row[2] ?? ''),
    assignedUser: row[3] ?? null,
    team: row[4] ?? null,
    location: row[5] ?? null,
  })).filter(r => r.serialNumber)

  return NextResponse.json({ rows: preview })
}