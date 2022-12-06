import { execa } from "execa"
import { nanoid } from "nanoid"
import { resolve } from "path"
import core from "./core"
import { gzip } from "compressing"
import { createWriteStream, readdir } from "fs-extra"
import { IncomingMessage } from "http"
import { ContentTypeParserDoneFunction } from "fastify/types/content-type-parser"
import { writeJSON, readJSON, remove, pathExists, mkdirs } from "fs-extra"

const APP_PATH = './APP'
const JSON_PATH = resolve(APP_PATH, 'index.json')

export default {
    init: async () => {
        if (!(await pathExists(APP_PATH))) {
            await mkdirs(APP_PATH)
        }

        if (!(await pathExists(JSON_PATH))) {
            await writeJSON(JSON_PATH, {})
        }

        // 加载所有函数
        const func_path = (await readdir(APP_PATH)).filter(d => d.length === 21)
        for (const path of func_path) {
            await core.load_func(path)
        }
    },
    installer: async (m: IncomingMessage, d: ContentTypeParserDoneFunction) => {
        const id = nanoid()
        const func_path = resolve(APP_PATH, id)
        // 解压文件
        const gs = new gzip.UncompressStream().pipe(createWriteStream(func_path))
        m.pipe(gs)

        m.on("end", async () => {
            // 安装依赖
            await execa("node_modules/pnpm/bin/pnpm.cjs", ['install', '-P'], {
                execPath: func_path
            })

            // 加载之
            const meta = await core.load_func(func_path)

            // 登记 id
            const name_id_map = await readJSON(JSON_PATH)
            name_id_map[meta["name"]] = id
            await writeJSON(JSON_PATH, name_id_map)

            d(null, meta)
        })
    },
    remover: async (name: string) => {
        // 查找对应文件
        const name_id_map = await readJSON(JSON_PATH)

        // 删除函数
        core.remove_func(name)

        // 删除对应文件
        await remove(resolve(APP_PATH, name_id_map[name]))

        // 抹除 ID
        delete name_id_map[name]
        await writeJSON(JSON_PATH, name_id_map)
    }
}