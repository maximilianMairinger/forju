import { DataBase, Data } from "josm";

export const mousePos = new DataBase({x: 0, y: 0})

document.body.addEventListener("mousemove", (e) => {
  mousePos({x: e.clientX, y: e.clientY})
})

export function bidirectionalBindData<T>(a: Data<T>, b: Data<T>) {
  const aSub = a.get((val) => {
    bSub.setToData(val)
  }, false)

  const bSub = b.get((val) => {
    aSub.setToData(val)
  })

  bSub.setToData(a.get())
  
  return [aSub, bSub]
}