export interface Notification {
  id: number
  sender_id: number
  receiver_id: number
  type: NotificationType
  entity_type: NotificationEntityType
  entity_id: number
  created_at: Date
  opened_at: Date | null
  sender_name?: string
  last_read_notification_id?: number | null
}

export type NotificationType = 'reply' | 'reaction' | 'peep'
export type NotificationEntityType = 'peep'

export interface openNotificationDTO {
  validIds: {
    notificationId: number
  }
}
