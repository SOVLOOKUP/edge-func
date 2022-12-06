export default (input: { a: number; b: number }) => {
    if (input.a < 0) throw Error("a Wrong!!!")
    return input.a + input.b
}