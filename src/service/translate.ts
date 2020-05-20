// @ts-nocheck
import { fetchGoogleTranslate } from './api';
import getGoogleTK, { clearCache } from './getGoogleTK';

const fixArrayError = (responseText) => {
  let text = responseText.replace(/\[,/g, '[null,');
  text = text.replace(/,\]/g, ',null]');
  text = text.replace(/,{2,}/g, (result) => result.split('').join('null'));
  return JSON.parse(text);
};

const keyWords = ['react native', 'react'];

function translate(keyword: string) {
  keyWords.forEach((key) => {
    keyword = keyword.replace(new RegExp(`(${key} )`), ($1) => {
      return $1
        .split(' ')
        .map(
          (vocabulary) =>
            vocabulary.slice(0, 1).toUpperCase() + vocabulary.slice(1),
        )
        .join(' ');
    });
  });
  return getGoogleTK(keyword).then((tk) => {
    if (!tk || !keyword) return;
    return fetchGoogleTranslate({
      keyword,
      tk,
    })
      .then(fixArrayError)
      .then((a) => {
        if (a && a[0] && a[0].length) {
          return a[0]
            .map((b) => b[0])
            .filter(Boolean)
            .join('');
        }
      })
      .then((result) => {
        console.log(result);
        return result;
      })
      .catch(() => {
        clearCache();
        return false;
      });
  });
}

window.$translate = translate;

export default translate;
