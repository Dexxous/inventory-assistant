import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const buffer = Buffer.from(await file.arrayBuffer())

  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

  const dataRows = rows.slice(1).map(row => ({
    inventoryNumber: row[0] ? String(row[0]) : null,
    name: row[1] ? String(row[1]) : 'Neznámé zařízení',
    serialNumber: String(row[2] ?? ''),
    assignedUser: row[3] ? String(row[3]) : null,
    team: row[4] ? String(row[4]) : null,
    location: row[5] ? String(row[5]) : null,
  })).filter(r => r.serialNumber)

  let count = 0
  for (const row of dataRows) {
    await prisma.device.upsert({
      where: { serialNumber: row.serialNumber },
      update: {
        name: row.name,
        inventoryNumber: row.inventoryNumber,
        assignedUser: row.assignedUser,
        team: row.team,
        location: row.location,
      },
      create: row
    })
    count++
  }

  return NextResponse.json({ success: true, count })
}