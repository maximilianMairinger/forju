import { EventListener } from "extended-dom"


export function oneOfTheseOnce<T>(eventListener: (EventListener | Promise<T>)[], nCount = 1) {
  const rmListener = () => {
    for (const ev of eventListener) if (ev instanceof EventListener) ev.deactivate()
  }
  return new Promise<T | Event>((res) => {
    let i = 0
    for (const ev of eventListener) {
      if (ev instanceof Promise) {
        ev.then((e) => {
          i++
          if (i < nCount) return
          rmListener()
          res(e)
        })
      }
      else {
        const prevListener = ev.listener()
        ev.listener((...a) => {
          i++
          if (i < nCount) return
  
          for (const list of prevListener) (list as any)(...a)
          rmListener()
          res(a[0])
        })
        ev.activate()
      }
    }
  })
}
