import global from "./global"




export async function init() {
  await global()
  
  const main = (await import("./main")).default
  main()


  // if ("serviceWorker" in navigator) {
  //   if (navigator.serviceWorker.controller) {
  //     console.log("[main-SW] Found Service worker")
  //   } else {
  //     await navigator.serviceWorker.register("./sw.js", {scope: "./"}).then(function(reg){
  //       console.log("[main-SW] Service worker installed with scope: " + reg.scope)
  //     })
  //   }
  // }
  // else {
  //   console.warn("[main-SW] Unable to install Service worker. Not supported.");
  // }
}
  
  


