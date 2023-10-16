import LinkedList, { LengthLinkedList } from "fast-linked-list";


export class Borrow<T> {
  private freeElems = new LengthLinkedList<T>()
  private takenElems = new LengthLinkedList<T>()
  get length() {
    return this.takenElems.length
  }
  constructor(private makeElem: () => T) {}

  borrow() {
    if (this.freeElems.first === undefined) {
      this.freeElems.push(this.makeElem())
    }
    const token = this.freeElems.popToken()
    this.takenElems.pushToken(token)
    return { elem: token.value, done: () => {
      this.freeElems.pushToken(token)
    }};
  }
}

export class BorrowMap<T> {
  private map = new Map<string, Borrow<T>>()
  constructor(private makeElem?: (key: string) => T) {

  }
  borrow(key: string, makeElem?: () => T) {
    if (!this.map.has(key)) {
      this.map.set(key, new Borrow(makeElem !== undefined ? makeElem : this.makeElem !== undefined ? () => this.makeElem(key) : () => { throw new Error("No makeElem function provided") }))
    }
    return this.map.get(key).borrow()
  }
}