import loader from './loader'
import type { LoadedFunc } from './loader'

const runningFunc: LoadedFunc[] = []

export default {
    load_func: async (path: string) => {
        const func = await loader(path)
        runningFunc.push(func)
        return func.meta
    },
    funcs: () => runningFunc.map(f => f.meta),
    call_func: async <I, O>(name: string, input: I): Promise<O> => {
        const f = runningFunc.find((f) => f.meta["name"] === name)
        if (f === undefined) {
            throw Error(`${name} not found`)
        } else {
            return await f.func(input)
        }
    },
    remove_func: (name: string) => { runningFunc.splice(runningFunc.findIndex((f) => f.meta["name"] === name)) }
}
