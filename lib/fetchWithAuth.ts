export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, init);

  if (res.redirected && res.url.includes('/sign-in')) {
    if (typeof window !== 'undefined') {
      window.location.href = res.url;
    }
    throw new Error('Redirecting to sign in');
  }

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      const redirectUrl = `/sign-in?redirect_url=${encodeURIComponent(window.location.href)}`;
      window.location.href = redirectUrl;
    }
    throw new Error('Unauthorized');
  }

  return res;
}

