import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"

function buildTargetUrl(pathSegments: string[], search: string) {
    const cleanBase = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL
    const cleanPath = pathSegments.join("/")

    return `${cleanBase}/${cleanPath}${search}`
}

function buildForwardHeaders(request: NextRequest) {
    const headers = new Headers()
    const contentType = request.headers.get("content-type")
    const authorization = request.headers.get("authorization")
    const accept = request.headers.get("accept")
    const requestId = request.headers.get("x-request-id")
    const acceptLanguage = request.headers.get("accept-language")
    const userAgent = request.headers.get("user-agent")

    // SECURITÉ : les headers x-dev-user-* simulent une identité backend
    // et NE DOIVENT JAMAIS être forwardés en production. Ils sont utilisés
    // uniquement en développement local pour tester sans JWT Supabase.
    const isDevEnvironment =
        process.env.NODE_ENV !== "production" ||
        process.env.ALLOW_DEV_USER_HEADERS === "true"

    const devUserId = isDevEnvironment ? request.headers.get("x-dev-user-id") : null
    const devUserEmail = isDevEnvironment ? request.headers.get("x-dev-user-email") : null

    if (contentType) {
        headers.set("content-type", contentType)
    }

    if (authorization) {
        headers.set("authorization", authorization)
    }

    if (accept) {
        headers.set("accept", accept)
    }

    if (requestId) {
        headers.set("x-request-id", requestId)
    }

    if (devUserId) {
        headers.set("x-dev-user-id", devUserId)
    }

    if (devUserEmail) {
        headers.set("x-dev-user-email", devUserEmail)
    }

    if (acceptLanguage) {
        headers.set("accept-language", acceptLanguage)
    }

    if (userAgent) {
        headers.set("user-agent", userAgent)
    }

    return headers
}

async function proxyRequest(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params

    // Safety: proxy uniquement vers le backend API
    if (!path || path.length === 0 || path[0] !== "api") {
        return NextResponse.json({ error: "Proxy path interdit" }, { status: 400 })
    }

    const targetUrl = buildTargetUrl(path, request.nextUrl.search)
    const headers = buildForwardHeaders(request)

    const init: RequestInit = {
        method: request.method,
        headers,
        cache: "no-store",
        redirect: "follow",
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
        init.body = await request.text()
    }

    try {
        const response = await fetch(targetUrl, init)
        const body = await response.text()
        const responseHeaders = new Headers()
        const contentType = response.headers.get("content-type")

        if (contentType) {
            responseHeaders.set("content-type", contentType)
        }

        if (response.ok) {
            const pathStr = path.join("/")
            const isProfileUpdate =
                (request.method === "PUT" && pathStr === "api/users/me") ||
                (request.method === "POST" && pathStr.startsWith("api/users/follow/")) ||
                (request.method === "DELETE" && pathStr === "api/users/account")

            if (isProfileUpdate) {
                try {
                    const { revalidateTag } = await import("next/cache")
                    revalidateTag("profile", "default")
                    console.log(`[CacheRevalidation] Revalidated tag 'profile' due to successful ${request.method} on /${pathStr}`)
                } catch (e) {
                    console.error("[CacheRevalidation] Failed to revalidate tag:", e)
                }
            }
        }

        return new NextResponse(body, {
            status: response.status,
            headers: responseHeaders,
        })
    } catch (error) {
        console.error(`Proxy backend inaccessible: ${targetUrl}`, error)

        return NextResponse.json(
            { error: "Backend inaccessible" },
            { status: 502 },
        )
    }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, context)
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, context)
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, context)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, context)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxyRequest(request, context)
}
