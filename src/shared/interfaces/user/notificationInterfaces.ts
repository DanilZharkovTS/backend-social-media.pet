export interface Notification {
  id: number
  sender_id: number
  receiver_id: number
  type: NotificationType
  entity_type: NotificationEntityType
  entity_id: number
  created_at: Date
}

export type NotificationType = 'reply' | 'reaction' | 'peep'
export type NotificationEntityType = 'peep'
