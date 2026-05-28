import { RateLimiterMemory } from 'rate-limiter-flexible'

const loginLimiter = new RateLimiterMemory({
  points: 5,        // 5 pokusů
  duration: 60,     // za 60 sekund
})

const apiLimiter = new RateLimiterMemory({
  points: 100,      // 100 requestů
  duration: 60,     // za 60 sekund
})

export async function checkLoginLimit(ip) {
  try {
    await loginLimiter.consume(ip)
    return { allowed: true }
  } catch {
    return { allowed: false, message: 'Příliš mnoho pokusů o přihlášení. Zkuste to za minutu.' }
  }
}

export async function checkApiLimit(ip) {
  try {
    await apiLimiter.consume(ip)
    return { allowed: true }
  } catch {
    return { allowed: false }
  }
}