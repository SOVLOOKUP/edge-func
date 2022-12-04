import { new_loader } from "./src"

const js_func_loader = await new_loader('js')

const func = await js_func_loader('./test_func/js')
const result = await func({
    a: 2,
    b: 8
})

console.log("2 + 8 =", result)