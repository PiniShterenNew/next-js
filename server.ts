import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { initSocketServer } from '@/lib/socket-server'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url || '', true)
    handle(req, res, parsedUrl)
  })

  // Initialize socket.io with our HTTP server
  initSocketServer(server)

  const port = process.env.PORT || 3000
  server.listen(port, () => {
    console.log(`🚀 Server ready on port ${port}`)
  })
})
