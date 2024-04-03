import fastify from 'fastify'
import loadConfig from './config/ServerConfiguration'

const CONFIG = loadConfig()
const server = fastify({
  connectionTimeout: 10,
  ignoreDuplicateSlashes: true,
  return503OnClosing: true,
  logger: {
    level: 'debug',
  }
})

server.get('/ping', async (request, reply) => {
  return 'pong\n'
})

server.listen({ 
  port: CONFIG.port
}, (err, address) => {})
