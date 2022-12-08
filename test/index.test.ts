import { expect, test } from 'vitest'

const TEST_FUNC_PATH = 'test/func'

test("loader", async () => {
    const js_loader = (await import("../src/loader")).default
    const { func } = await js_loader(TEST_FUNC_PATH)
    expect(await func({
        a: 2,
        b: 8
    })).toBe(10)
})

test("core", async () => {
    const core = (await import("../src/core")).default

    expect(core.funcs()).toStrictEqual([])

    await core.load_func(TEST_FUNC_PATH)

    expect(core.funcs().length).toBe(1)

    expect(await core.call_func("sum", {
        a: 2,
        b: 8
    })).toBe(10)

    core.remove_func("sum")

    expect(core.funcs()).toStrictEqual([])
})

test("manager", async () => {
    const core = (await import("../src/core")).default

    expect(core.funcs()).toStrictEqual([])

    await core.load_func(TEST_FUNC_PATH)

    expect(core.funcs().length).toBe(1)

    expect(await core.call_func("sum", {
        a: 2,
        b: 8
    })).toBe(10)

    core.remove_func("sum")

    expect(core.funcs()).toStrictEqual([])
})