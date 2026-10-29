import { renderClient } from '@client/render'
import { startServer } from './start-server'

startServer().then(() => renderClient(document.getElementById('root')!))
