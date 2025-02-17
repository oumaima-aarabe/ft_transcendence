import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const unprotectedPaths = [
	'/',
	'/auth',
]

export async function middleware(request: NextRequest) {
}
	const { pathname } = request.nextUrl

	const accessToken = request.cookies.get('accessToken')
	const refreshToken = request.cookies.get('refreshToken')
	console.log('accessToken: ', accessToken);
	console.log('refreshToken: ', refreshToken);

	if (!accessToken && !refreshToken) {
		if (unprotectedPaths.includes(pathname)) {
			return NextResponse.next()
		}
		else {
			return NextResponse.redirect(new URL('/', request.url))
		}
	}
	else if (!accessToken && refreshToken) {
		try {
			const response = await fetch('http://localhost:8000/api/auth/token/refresh', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${refreshToken.value}`
				}
			});
			const response_data = await response.json();
			console.log('REF: ', response_data)
			if (response_data.data) {
				if (unprotectedPaths.includes(pathname)) {
					return NextResponse.redirect(new URL('/dashboard', request.url))
				}
				else {
					return NextResponse.next()
				}
			}
			else {
				request.cookies.delete('accessToken')
				request.cookies.delete('refreshToken')
				return NextResponse.redirect(new URL('/', request.url))
			}
		} catch (error) { 
			console.error('Error:', error)
			request.cookies.delete('accessToken')
			request.cookies.delete('refreshToken')
			return NextResponse.redirect(new URL('/', request.url))
		}
	}
	else {
		try {
			const response = await fetch('http://localhost:8000/api/auth/token/verify', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${accessToken?.value}`
				}
			});
			const response_data = await response.json();
			console.log('DATA: ', response_data)
			if (response_data.message) {
				if (unprotectedPaths.includes(request.nextUrl.pathname)) {
					console.log('hhere');
					return NextResponse.redirect(new URL('/dashboard', request.url))
				}
				else {
					return NextResponse.next()
				}
			}
			else {
				request.cookies.delete('accessToken')
				request.cookies.delete('refreshToken')
				return NextResponse.redirect(new URL('/', request.url))
			}
		} catch (error) {
			console.error('Error:', error)
			request.cookies.delete('accessToken')
			request.cookies.delete('refreshToken')
			return NextResponse.redirect(new URL('/', request.url))
		}
	}
}

export const config = {
    matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\..*|assets/|images/|backgrounds/|logos/).*)',
}