import { ApiError } from '../../utils/apiError'

const RESERVED_ROLE_PATTERN = /\b(admin|administrator|administrateur|superadmin|root|moderator|modérateur)\b/i
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface RegisterUserBody {
  email: string
  password: string
  first_name?: string
  last_name?: string
  role?: string
}

function asNonEmptyString(value: unknown, field: string, maxLen?: number) {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (typeof maxLen === 'number') return trimmed.slice(0, maxLen)
  return trimmed
}

export function parseRegisterUserBody(body: unknown): RegisterUserBody {
  if (!body || typeof body !== 'object') {
    throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'Body invalide')
  }
  const input = body as Record<string, unknown>

  const rawEmail = asNonEmptyString(input.email, 'email')?.toLowerCase()
  const password = asNonEmptyString(input.password, 'password')
  if (!rawEmail || !EMAIL_PATTERN.test(rawEmail) || !password) {
    throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'Email ou mot de passe invalide')
  }
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'Mot de passe trop faible')
  }

  const role = asNonEmptyString(input.role, 'role', 100)
  if (role && RESERVED_ROLE_PATTERN.test(role)) {
    throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'Rôle réservé non autorisé à l’inscription')
  }

  return {
    email: rawEmail,
    password,
    first_name: asNonEmptyString(input.first_name, 'first_name', 100),
    last_name: asNonEmptyString(input.last_name, 'last_name', 100),
    role: role || undefined,
  }
}

