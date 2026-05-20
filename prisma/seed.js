import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where: { email: 'admin@company.cz' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@company.cz',
      password: hash,
      role: 'ADMIN'
    }
  })
  console.log('✅ Admin účet vytvořen: admin@company.cz / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())