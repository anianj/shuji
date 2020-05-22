
import googleTK from './googleTK';
import { fetchGoogleChina } from './api';

let cacheTk: string;

export default (keyString: string) => {
  if (cacheTk) {
    return Promise.resolve(googleTK(keyString, cacheTk));
  }
  return fetchGoogleChina().then((html) => {
    const TKKMatch = html.match(/tkk:'([\d.]+)'/);
    const TKK = TKKMatch && TKKMatch[1];
    if (TKK) {
      window.TKK = TKK;
      if (typeof window.TKK !== 'undefined') {
        cacheTk = window.TKK;
        const tk = googleTK(keyString, cacheTk);
        return tk;
      }
    }
  }).catch((e) => {
    cacheTk = ''
    throw e
  });
};
