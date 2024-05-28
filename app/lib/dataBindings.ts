import { DataBase } from "josm";

export const mousePos = new DataBase({x: 0, y: 0})

document.body.addEventListener("mousemove", (e) => {
  mousePos({x: e.clientX, y: e.clientY})
})