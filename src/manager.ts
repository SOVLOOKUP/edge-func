import { nanoid } from "nanoid"
import { resolve } from "path"
import core from "./core"
import { readdir } from "fs-extra"
import { writeJSON, readJSON, remove, pathExists, mkdirs } from "fs-extra"
import type adm from 'adm-zip'
import { execa } from "execa"

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
            await core.load_func(resolve(APP_PATH, path))
        }
    },
    installer: (m: adm) => new Promise((ok, reject) => {
        const id = nanoid()
        const func_path = resolve(APP_PATH, id)
        // 解压文件

        m.extractAllToAsync(func_path, true, false, async () => {
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

            ok(meta)
        })
    }),
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