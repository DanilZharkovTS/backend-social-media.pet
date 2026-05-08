import { Socket } from 'socket.io'
import { IoNextFn } from '../../shared/interfaces/global/socket'
import { openNotificationDTO } from '../../shared/interfaces/user/notificationInterfaces'
import { notificationService } from '../../shared/services/user/notificationService'

export const notificationHandler = {
  openNotification: async (
    socket: Socket,
    data: any,
    ctx: openNotificationDTO,
    next: IoNextFn
  ) => {
    try {
      const result = await notificationService.openNotification(
        socket.user,
        ctx
      )
      socket
        .to(`users:${result.receiver_id}`)
        .emit('notification:opened', result)
      socket.emit('notification:opened', result)
    } catch (err) {
      next(err)
    }
  },
}
