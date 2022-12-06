import core from './core'
import { fastify } from 'fastify'
import manager from './manager'

const server = fastify({
    logger: true
})

server.get('/', (request, reply) => {
    reply.send(core.funcs())
})

server.delete('/:name', async (request, reply) => {
    reply.send(await manager.remover((request.params as any).name))
})

server.addContentTypeParser('/', async (request, payload, done) =>
    await manager.installer(payload, done)
)

server.post('/:name', async (request, reply) => {
    reply.send(await core.call_func((request.params as any).name, request.body))
})

async function main() {
    await manager.init()
    server.listen({ port: 3000 }, function (err, address) {
        if (err) {
            server.log.error(err)
            process.exit(1)
        }
        server.log.info(`server listening on ${address}`)
    })
}
main()