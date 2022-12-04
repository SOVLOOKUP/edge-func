import { z } from 'zod'
import js_loader from './loaders/js_loader'

const plg_loader_type =
    z.function().args(z.string()).returns(z.promise(z.function().args(z.any()).returns(z.promise(z.any()))))

enum LoaderType {
    js = 'js'
}

const new_loader = async (path: LoaderType | string) => {
    switch (path) {
        case LoaderType.js:
            return js_loader

        default:
            return await plg_loader_type.parseAsync((await import(path)).default)
    }
}

export { new_loader }
