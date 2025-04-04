import { Data } from "josm"

export function waitUntilDataEquals<T>(data: Data<T>, equals: (d: T) => boolean) {
  return new Promise<T>((res) => {
    data.get((d) => {
      if (equals(d)) res(d)
    })  
  })
}