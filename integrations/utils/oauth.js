import isReactNative from './isReactNative';

export function getCallbackUrl() {
  return isReactNative
    ? 'com.tmrow.greenbit://oauth_callback'
    : 'http://localhost:3000/oauth_callback';
}
