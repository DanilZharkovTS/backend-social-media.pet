export type ChatType = 'private' | 'group'

export interface Chat {
  id: number
  type: ChatType
  name: string | null
  created_at: Date
  updated_at: Date
}

export interface createOrFindPrivateChatDTO {
  secondUserId: number
}

export interface joinChatRoomDTO {
  validIds: {
    chatId: number
  }
}

export interface leaveChatRoomDTO {
  validIds: {
    chatId: number
  }
}