import delay from "tiny-delay"
import LinkedList, { Token } from "fast-linked-list"
import { isPromiseLike } from "./util"
import { ResableSyncPromise } from "more-proms"

export class BasicRecord<T> {
  protected ls = [] as T[]
  // name is just for debugging purposes
  constructor(public name?: string | PromiseLike<string>) {}
  flush(): T[] {
    const ret = this.ls
    this.ls = []
    return ret
  }
  add(e: T) {
    this.ls.push(e)
  }
}

type Record<T> = BasicRecord<T> | FutureRecord<T>

export class FutureRecord<R> {
  private prom = new ResableSyncPromise<void>()
  // name is just for debugging purposes
  constructor(public name: string | PromiseLike<string>) {}
  add<T extends R>(f: () => PromiseLike<T>): PromiseLike<T> {
    return this.prom.then(() => f())  
  }
  flush() {
    return this.prom.res() as any as ResableSyncPromise<R[]>
  }
}


type StackedRecord<Rec extends Record<R>, R> = {
  readonly currentRecord: Rec
  record: (name_doneRecordingCbToBringToTop: string | {name: string | PromiseLike<string>} | Rec) => () => R[]
  add: (val: () => R) => void
}



function mkStackAbleRecord(Record: typeof BasicRecord): {new<T>(): StackedBasicRecord<T>}
function mkStackAbleRecord(Record: typeof FutureRecord): {new<T>(): StackedFutureRecord<T>}
function mkStackAbleRecord(Record: typeof BasicRecord | typeof FutureRecord): any {

  return class StackedRecord<R> {
    private records = new LinkedList<Record<R>>()

    get currentRecord() {
      return this.records.last
    }

    record(name_doneRecordingCbToBringToTop: string | {name: string | PromiseLike<string>} | Record<R>) {
      let currentRecord: Record<R>
      if (typeof name_doneRecordingCbToBringToTop === "string" || (typeof name_doneRecordingCbToBringToTop === "object" && !(name_doneRecordingCbToBringToTop instanceof Record))) {
        currentRecord = new Record(typeof name_doneRecordingCbToBringToTop === "string" ? name_doneRecordingCbToBringToTop : name_doneRecordingCbToBringToTop.name)
      }
      else {
        currentRecord = name_doneRecordingCbToBringToTop
      }

      const token = this.records.push(currentRecord)

      const flush = () => {
        token.remove()
        return token.value.flush()
      }
      flush.token = token
      return flush
    }
    add(val: (() => PromiseLike<R>) & R) {
      if (this.records.empty) throw new Error("No record to add to")
      else return this.records.lastToken.value.add(val)
    }
  }
}

export type StackedBasicRecord<R> = StackedRecord<BasicRecord<R>, R>
export type StackedFutureRecord<R> = StackedRecord<FutureRecord<R>, R>
export const StackedBasicRecord = mkStackAbleRecord(BasicRecord)
export const StackedFutureRecord = mkStackAbleRecord(FutureRecord)