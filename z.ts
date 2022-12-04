import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

const input = z.object({
    a: z.number().gt(0),
    b: z.number()
})

console.log(zodToJsonSchema(input))
