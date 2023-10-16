import polyfill from "extended-dom"
import "xrray"


export default async function() {
  await polyfill()
  //@ts-ignore
  global.log = console.log
  //@ts-ignore
  global.ce = document.createElement.bind(document)
}

declare global {
  function log(...msg: any[]): void
  
  function ce<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions) : HTMLElementTagNameMap[K];
  function ce(name: string) : HTMLElement;
}



