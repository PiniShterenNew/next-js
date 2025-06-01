import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n.config';

// Define which routes require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/dashboard/invoices(.*)',
  '/dashboard/customers(.*)',
  '/dashboard/settings(.*)',
  '/api/invoices(.*)',
  '/api/customers(.*)',
  '/api/settings(.*)',
])

// Define public routes that should be accessible without authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)', // For Clerk webhooks
])

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
});

// Combine Clerk and next-intl middleware
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // אם זה מסלול פומבי – אפשר לעבור בלי קשר ל־auth
  if (isPublicRoute(req)) {
    return await intlMiddleware(req);
  }

  // אם זה מסלול מוגן ואין משתמש – הפניה להתחברות
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return Response.redirect(signInUrl)
  }

  // אם המשתמש מחובר ונכנס לדף התחברות – העבר לדשבורד
  if (userId && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
    return Response.redirect(new URL('/dashboard', req.url))
  }
  
  // Apply internationalization middleware for all other routes
  return await intlMiddleware(req);
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}