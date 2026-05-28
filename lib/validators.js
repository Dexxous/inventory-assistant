import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Neplatný email'),
  password: z.string().min(6, 'Heslo musí mít alespoň 6 znaků')
})

export const userSchema = z.object({
  name: z.string().min(2, 'Jméno musí mít alespoň 2 znaky').max(100),
  email: z.string().email('Neplatný email'),
  password: z.string().min(8, 'Heslo musí mít alespoň 8 znaků'),
  role: z.enum(['ADMIN', 'USER', 'MANAGER']),
  team: z.string().max(100).optional().nullable()
})

export const deviceSchema = z.object({
  serialNumber: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  team: z.string().max(100).optional().nullable(),
  note: z.string().max(500).optional().nullable()
})

export const scanSchema = z.object({
  serialNumber: z.string().min(1, 'Sériové číslo je povinné').max(200),
  note: z.string().max(500).optional().nullable()
})

export const sessionSchema = z.object({
  name: z.string().min(2, 'Název musí mít alespoň 2 znaky').max(200)
})