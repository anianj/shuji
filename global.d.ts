declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare module "*.css"{
  export default any;
}
declare module "getusermedia"{
  export default any;
}

declare global {
  interface Window {
    TKK: string;
  }
}