const isProd = process.env.NODE_ENV === 'production';

export function getCallbackUrl() {
  if (isProd) {
    return 'https://app.bloomclimate.com/auth-callback';
  }
  return 'http://localhost:8000/auth-callback';
}
