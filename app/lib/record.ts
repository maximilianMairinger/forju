import delay from "tiny-delay"
import LinkedList from "fast-linked-list"



export class Record<T> {
  protected ls = [] as T[]
  doneRecording(): T[] {
    const ret = this.ls
    this.ls = []
    return ret
  }
  add(...e: T[]) {
    this.ls.push(...e)
  }
}

export class TaskRecord<R, T extends () => R = () => R> extends Record<T>{
  // @ts-ignore
  doneRecording() {
    return super.doneRecording().map(f => f())
  }
}

export class AsyncTaskRecord<Q, R extends Promise<Q> | Q = Promise<Q> | Q, T extends () => R = () => R> extends TaskRecord<R, T> {
  // @ts-ignore
  doneRecording(): Promise<Q[]> {
    return Promise.all(super.doneRecording())
  }
}


function makeStackedRecord(MyRecord: typeof Record): {new<T>(resolveAddOnEmpty?: (val: any) => void): {add: Record<T>["add"], record: () => Record<T>["doneRecording"]}}
function makeStackedRecord(MyRecord: typeof TaskRecord): {new<T>(resolveAddOnEmpty?: (val: any) => void): {add: TaskRecord<T>["add"], record: () => TaskRecord<T>["doneRecording"]}}
function makeStackedRecord(MyRecord: typeof AsyncTaskRecord): {new<T>(resolveAddOnEmpty?: (val: any) => void): {add: AsyncTaskRecord<T>["add"], record: () => AsyncTaskRecord<T>["doneRecording"]}}
function makeStackedRecord(MyRecord: {new<T>(): {add: any, doneRecording: any}}): any {
  return class StackedNewRecord<T> {
    constructor(private resolveAddOnEmpty?: (val: T) => void) {

    }
    private records = new LinkedList<any>()
    record() {
      const tok = this.records.push(new MyRecord<T>())
      const doneRecording = () => {
        tok.remove()
        return tok.value.doneRecording()
      }
      return doneRecording
    }
    add(val: T) {
      if (this.records.empty) {
        if (this.resolveAddOnEmpty) this.resolveAddOnEmpty(val)
        else throw new Error("No record to add to")
      }
      else this.records.lastToken.value.add(val)
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

