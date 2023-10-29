import { EventListener } from "extended-dom"


export function oneOfTheseOnce(...eventListener: EventListener[]) {
  const rmListener = () => {
    for (const ev of eventListener) ev.deactivate()
  }
  return (func: (e: Event) => boolean | void, nCount = 1) => {
    let i = 0
    for (const ev of eventListener) {
      const prevListener = ev.listener()
      ev.listener((...a) => {
        i++
        if (i < nCount) return

        for (const list of prevListener) (list as any)(...a)
        let res = func(...a)
        res = res === undefined ? true : res
        if (res) rmListener()
      })
      ev.activate()
    }

  }
}
