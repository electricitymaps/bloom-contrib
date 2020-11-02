import isReactNative from './isReactNative';

const isProd = process.env.NODE_ENV === 'production';

export function getCallbackUrl() {
  if (isReactNative) {
    return 'https://north-app.com/callback/';
  }
  if (isProd) {
    return 'https://app.bloomclimate.com/auth-callback';
  }
  return 'http://localhost:8000/auth-callback';
}
