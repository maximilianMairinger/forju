import delay from "tiny-delay"
import LinkedList, { Token } from "fast-linked-list"
import { isPromiseLike } from "./util"



export class Record<T> {
  protected ls = [] as T[]
  // name is just for debugging purposes
  constructor(public name?: string | PromiseLike<string>) {}
  doneRecording(): T[] {
    const ret = this.ls
    this.ls = []
    return ret
  }
  add(e: T) {
    this.ls.push(e)
  }
}

export class TaskRecord<R, T extends () => R = () => R> extends Record<T>{
  // @ts-ignore
  doneRecording() {
    return super.doneRecording().map(f => f())
  }
  add<F extends T>(ogF: F) {
    return new Promise<Awaited<ReturnType<F>>>((res, rej) => {
      super.add((() => {
        try {
          res(ogF() as any)
        }
        catch(e) {
          rej(e)
        }
      }) as any as T)
    })
  }
}

export class AsyncTaskRecord<Q, R extends Promise<Q> | Q = Promise<Q> | Q, T extends () => R = () => R> extends TaskRecord<R, T> {
  // @ts-ignore
  doneRecording(): Promise<Q[]> {
    return Promise.all(super.doneRecording())
  }
}


function makeStackedRecord(MyRecord: typeof Record): {new<T>(resolveAddOnEmpty?: (val: any) => void): {add: Record<T>["add"], record: (name_doneRecordingCbToBringToTop?: PromiseLike<string> | string | (() => any) & { token: Token }) => (Record<T>["doneRecording"] & { token: Token })}}
function makeStackedRecord(MyRecord: typeof TaskRecord): {new<T>(resolveAddOnEmpty?: (val: any) => void): {add: TaskRecord<T>["add"], record: (name_doneRecordingCbToBringToTop: PromiseLike<string> | string | (() => any) & { token: Token }) => (TaskRecord<T>["doneRecording"] & { token: Token })}}
function makeStackedRecord(MyRecord: typeof AsyncTaskRecord): {new<T>(resolveAddOnEmpty?: (val: any) => void): {add: AsyncTaskRecord<T>["add"], record: (name_doneRecordingCbToBringToTop: PromiseLike<string> | string | (() => any) & { token: Token }) => (AsyncTaskRecord<T>["doneRecording"] & { token: Token })}}
function makeStackedRecord(MyRecord: {new<T>(name?: string | Promise<string>): {add: any, doneRecording: any}}): any {
  return class StackedNewRecord<T> {
    constructor(public name: string, private resolveAddOnEmpty?: (val: T) => unknown) {

    }
    private records = new LinkedList<any>()
    record(name_doneRecordingCbToBringToTop: Promise<string> | (string | (() => void) & { token: Token })) {
      const tok = (typeof name_doneRecordingCbToBringToTop === "string" || isPromiseLike(name_doneRecordingCbToBringToTop)) ? this.records.push(new MyRecord<T>(name_doneRecordingCbToBringToTop)) : this.records.pushToken(name_doneRecordingCbToBringToTop.token)
      const doneRecording = () => {
        tok.remove()
        // make two callbacks here. One for stop recording and the other to resolve.
        return tok.value.doneRecording()
      }
      doneRecording.token = tok
      return doneRecording
    }
    add(val: T) {
      if (this.records.empty) {
        if (this.resolveAddOnEmpty) return this.resolveAddOnEmpty(val)
        else throw new Error("No record to add to")
      }
      else return this.records.lastToken.value.add(val)
    }
  }
}

export const StackedRecord = makeStackedRecord(Record)
export const StackedTaskRecord = makeStackedRecord(TaskRecord)
export const StackedAsyncTaskRecord = makeStackedRecord(AsyncTaskRecord)


// export abstract class Record<T, R> {
//   protected recordLs: T[]
//   private done = false
//   constructor(private once: boolean = true) {}

//   abstract record(): () => R

//   protected _record(f: (record: T[]) => R) {
//     const old = this.recordLs
//     const record = this.recordLs = [] as T[]
//     const doneRecording = () => {
//       if (this.once) this.done = true
//       this.recordLs = old
//       return f(record)
//     }
//     return doneRecording
//   }
//   add(...e: T[]) {
//     if (this.done) throw new Error("Cannot add to a record that is done")
//     else this.recordLs.add(...e)
//   }
// }

// type Primitive = string | number | boolean | symbol | object
// export class PrimitiveRecord<E extends Primitive = string> extends Record<E, E[]> {
//   record() {
//     return this._record(record => record)
//   }
// }


// type F = () => void
// export class InstanceRecord extends Record<F, () => Promise<any>> {
//   constructor(noRecordFoundCallback: () => void) {
//     super()
//     const addProxy = this.add = (...e: F[]) => {
//       noRecordFoundCallback()
//       return Promise.all(e.call())
//     }
//     const recProxy = this.record = () => {
//       delete this.record
//       delete this.add
//       const done = this.record()
//       return /* Done recording */() => {
//         this.record = recProxy
//         this.add = addProxy
//         return done()
//       }
//     }
//   }

//   record() {
//     return this._record((record) => function batchLoad() {
//       let ret = Promise.all(record.call())
//       let retHasSettled = false
//       ret.finally(() => {retHasSettled = true})
//       delay(3000).then(() => {if (!retHasSettled) console.error("Took too long to load")})
//       record.clear()
//       return ret
//     })
//   }
// }

