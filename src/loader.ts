import ajv from 'ajv'
import { pathExists, readFile } from 'fs-extra'
import { resolve } from 'path'
import { parse } from 'json5'

const Ajv = new ajv()

export interface LoadedFunc {
    meta: object
    func: Function
}

export default async <T>(path: string): Promise<LoadedFunc> => {
    if (!(await pathExists(path))) {
        throw Error(`no pkg ${path}`)
    }

    const pkg_path = resolve(path, 'package.json')

    if (!(await pathExists(pkg_path))) {
        throw Error(`no pkg meta ${pkg_path}`)
    }
    const pkgmeta = parse(await readFile(pkg_path, 'utf8'))
    const pkg_main = resolve(path, pkgmeta.main)

    if (!(await pathExists(pkg_main))) {
        throw Error(`no pkg main ${pkg_main}`)
    }

    const func = (await import(pkg_main)).default

    if (!(Ajv.validateSchema(pkgmeta.input) && Ajv.validateSchema(pkgmeta.output))) {
        throw Error("wrong schema!")
    }

    return {
        func: async (input: T) => {
            if (!Ajv.validate(pkgmeta.input, input)) {
                throw Error("wrong input!")
            }

            return await func(input)
        },
        meta: pkgmeta
    }
}
