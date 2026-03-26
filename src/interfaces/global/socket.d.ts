import 'socket.io'
import { TokenPayload } from '../auth/authInterfaces'

declare module 'socket.io' {
  interface Socket {
    user: TokenPayload
  }
}

export type IoNextFn = (err?: Error) => void
