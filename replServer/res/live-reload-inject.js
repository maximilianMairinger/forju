const ws = new WebSocket((document.location.protocol === "https:" ? "wss://" : "ws://") + document.location.host + wsUrl);

ws.addEventListener("message", reload)
ws.addEventListener("error", (e) => {
  console.error("Error with live reload WS", e)
})




async function reload() {
  console.log("Reloading...")
  // let proms = []
  // await navigator.serviceWorker.getRegistrations().then(function(registrations) {
  //   console.log("Unregistering the following sw", registrations)
  //   for(let registration of registrations) {
  //     proms.push(registration.unregister())
  //   }
  // })

  // await Promise.all(proms)
  location.reload()
}
