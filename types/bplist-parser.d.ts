declare module "bplist-parser" {
  export let maxObjectSize: number
  export let maxObjectCount: number
  export class UID {
    constructor(id: number)
    UID: number
  }
  export function parseBuffer(buffer: Buffer): [any]
  export function parseFile(
    fileNameOrBuffer: string | Buffer,
    callback?: (err: any, result: any) => void
  ): Promise<[any]>
}
