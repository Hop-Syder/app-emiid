import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000"

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

    if (contentType) {
        headers.set("content-type", contentType)
    }

    if (authorization) {
        headers.set("authorization", authorization)
    }

    if (accept) {
        headers.set("accept", accept)
    }

    return headers
}

async function proxyRequest(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    const { path } = await context.params
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
