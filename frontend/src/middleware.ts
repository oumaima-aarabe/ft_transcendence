// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/auth']

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl

	const accessToken = request.cookies.get('accessToken')?.value

	console.log(pathname)
	if (accessToken) {
		try {
			const tokenData = JSON.parse(atob(accessToken.split('.')[1]))
			const isTokenValid = tokenData.exp * 1000 > Date.now()
			if (isTokenValid) {
				if (PUBLIC_PATHS.includes(pathname)) {
					if (pathname == '/dashboard')
						return NextResponse.next()
					return NextResponse.redirect(new URL('/dashboard', request.url))
				}
				return NextResponse.next()
			}
		} catch (error) {
			console.log(error)
		}
	}

	const refreshToken = request.cookies.get('refreshToken')?.value

	if (refreshToken) {
		try {
			const response = await fetch(`http://127.0.0.1:8000/api/auth/token/refresh`, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ refreshToken: refreshToken }),
			})

			if (response.ok) {
				const data = await response.json()
				const res = NextResponse.redirect(request.url)
		
				res.cookies.set({
					name: 'accessToken',
					value: data.accessToken,
					httpOnly: true,
					secure: process.env.NODE_ENV !== 'development',
					sameSite: 'strict',
					path: '/',
					maxAge: 60 * 30, // 30 minutes
				})

				return res
			}
		} catch (error) {
			console.log(error)
		}
	}

	const url = new URL('/', request.url)
	if (PUBLIC_PATHS.includes(pathname)) {
			return NextResponse.next()
	}
	// return NextResponse.next()
	return NextResponse.redirect(url)
}

// Configure which paths the middleware runs on
export const config = {
	matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\..*|assets/|images/|backgrounds/|logos/).*)',
}