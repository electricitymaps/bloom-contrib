import isReactNative from './isReactNative';

export function getCallbackUrl() {
  return isReactNative
    ? 'https://north-app.com/callback'
    : 'http://localhost:3000/oauth_callback';
}
