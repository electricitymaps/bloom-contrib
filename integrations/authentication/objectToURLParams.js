import { URLSearchParams } from 'whatwg-url';

export default function (obj) {
  const body = new URLSearchParams();
  Object.keys(obj).forEach((k) => {
    body.append(k, obj[k]);
  });
  return body.toString();
}
