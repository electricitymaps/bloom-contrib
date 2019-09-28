import isReactNative from './isReactNative';

export function getCallbackUrl() {
  return isReactNative
    ? 'com.tmrow.greenbit://oauth_callback'
    : 'http://localhost:3333/oauth_callback';
}
