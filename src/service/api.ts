
export const fetchGoogleChina = () => window.fetch(new Request('https://translate.google.cn')).then(r => r.text())


type TranslateOptions = {
    fromLanguage?: 'en' | 'zh-CN' | 'auto';
    toLanguage?: 'en' | 'zh-CN';
    webLanguage?: 'en' | 'zh-CN';
    tk: string;
    keyword: string;
}
export const fetchGoogleTranslate = (option?: TranslateOptions) => {
    const { fromLanguage =  'auto', toLanguage = 'zh-CN', webLanguage = 'zh-CN', tk, keyword } = option || {};
    let url = 'https://translate.google.cn/translate_a/single?client=webapp&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=sos&dt=ss&dt=t&otf=1&ssel=0&tsel=0&kc=1'
    url += `&sl=${fromLanguage}&tl=${toLanguage}&hl=${webLanguage}&tk=${tk}&q=${encodeURIComponent(keyword)}`
  
    return window.fetch(new Request(url)).then((a) => a.text())
  }