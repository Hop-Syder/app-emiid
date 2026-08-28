import { ApiError } from '../../utils/apiError'

const RESERVED_ROLE_PATTERN = /\b(admin|administrator|administrateur|superadmin|root|moderator|modérateur)\b/i
const PIN_PATTERN = /^\d{6}$/
const PHONE_PATTERN = /^\+?[0-9\s().-]{8,20}$/
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function asString(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function trimOrUndefined(value: unknown, maxLen?: number) {
  const str = asString(value)
  if (!str) return undefined
  const trimmed = str.trim()
  if (!trimmed) return undefined
  return typeof maxLen === 'number' ? trimmed.slice(0, maxLen) : trimmed
}

function nullableTrim(value: unknown, maxLen: number) {
  if (value === null) return null
  const v = trimOrUndefined(value, maxLen)
  return v === undefined ? undefined : v
}

export interface VerifyPinBody {
  pin: string
}

export function parseVerifyPinBody(body: unknown): VerifyPinBody {
  if (!body || typeof body !== 'object') throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'Body invalide')
  const pin = trimOrUndefined((body as any).pin)
  if (!pin || !PIN_PATTERN.test(pin)) throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'PIN invalide')
  return { pin }
}

export interface RequestPhoneVerificationBody {
  phone: string
  method?: 'whatsapp' | 'sms'
}

export function parseRequestPhoneVerificationBody(body: unknown): RequestPhoneVerificationBody {
  if (!body || typeof body !== 'object') throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'Body invalide')
  const phone = trimOrUndefined((body as any).phone)
  if (!phone || !PHONE_PATTERN.test(phone)) throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'Téléphone invalide')
  const methodRaw = trimOrUndefined((body as any).method)
  const method = methodRaw === 'whatsapp' || methodRaw === 'sms' ? methodRaw : undefined
  return { phone, method }
}

export interface VerifyPhoneBody {
  phone: string
  code: string
}

export function parseVerifyPhoneBody(body: unknown): VerifyPhoneBody {
  if (!body || typeof body !== 'object') throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'Body invalide')
  const phone = trimOrUndefined((body as any).phone)
  const code = trimOrUndefined((body as any).code)
  if (!phone || !PHONE_PATTERN.test(phone) || !code || !PIN_PATTERN.test(code)) {
    throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'Paramètres invalides')
  }
  return { phone, code }
}

export interface UpdateMyProfileBody {
  first_name?: string | null
  last_name?: string | null
  bio?: string | null
  avatar_url?: string | null
  role?: string | null
  specialty?: string | null
  category?: string | null
  activity_domain?: string | null
  country_id?: string | null
  country_code?: string | null
  country_name?: string | null
  city?: string | null
  job_title?: string | null
  industry?: string | null
  pin_enabled?: boolean
  pin_code?: string
  phone?: string | null
  website?: string | null
  is_published?: boolean
  tags?: string[]
  card_variant?: string | null
  slug?: string | null
}

export function parseUpdateMyProfileBody(body: unknown): UpdateMyProfileBody {
  if (!body || typeof body !== 'object') throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'Body invalide')
  const input = body as Record<string, unknown>

  const pin_code = trimOrUndefined(input.pin_code)
  if (pin_code && !PIN_PATTERN.test(pin_code)) throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'PIN invalide')

  const role = nullableTrim(input.role, 100)
  if (typeof role === 'string' && RESERVED_ROLE_PATTERN.test(role)) {
    throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'Rôle réservé')
  }

  const country_id = nullableTrim(input.country_id, 36)
  if (typeof country_id === 'string' && !UUID_PATTERN.test(country_id)) {
    throw new ApiError(422, 'UNPROCESSABLE_ENTITY', 'country_id invalide')
  }

  const tagsRaw = input.tags
  const tags = Array.isArray(tagsRaw)
    ? tagsRaw
        .map((t) => trimOrUndefined(t, 50))
        .filter((t): t is string => typeof t === 'string' && t.length > 0)
    : undefined

  return {
    first_name: nullableTrim(input.first_name, 100),
    last_name: nullableTrim(input.last_name, 100),
    bio: nullableTrim(input.bio, 1000),
    avatar_url: nullableTrim(input.avatar_url, 2048),
    role,
    specialty: nullableTrim(input.specialty, 255),
    category: nullableTrim(input.category, 50),
    activity_domain: nullableTrim(input.activity_domain, 100),
    country_id: country_id === undefined ? undefined : country_id,
    country_code: nullableTrim(input.country_code, 2),
    country_name: nullableTrim(input.country_name, 100),
    city: nullableTrim(input.city, 100),
    job_title: nullableTrim(input.job_title, 100),
    industry: nullableTrim(input.industry, 100),
    pin_enabled: typeof input.pin_enabled === 'boolean' ? input.pin_enabled : undefined,
    pin_code,
    phone: nullableTrim(input.phone, 20),
    website: nullableTrim(input.website, 2048),
    is_published: typeof input.is_published === 'boolean' ? input.is_published : undefined,
    tags,
    card_variant: nullableTrim(input.card_variant, 50),
    slug: nullableTrim(input.slug, 80),
  }
}

