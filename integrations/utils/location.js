import { ValidationError } from './errors';

// Returns array [lon, lat]
export async function cityToLonLat(country, zip) {
  if (country === 'DK') {
    return fetch(`http://dawa.aws.dk/postnumre/${zip}`)
      .then(res => res.json())
      .then(city => city.visueltcenter);
  }
  throw new ValidationError('cityToLonLat: Country not supported');
}
