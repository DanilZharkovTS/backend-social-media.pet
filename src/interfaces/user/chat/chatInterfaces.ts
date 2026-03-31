export type ChatType = 'private' | 'group'

export interface Chat {
  id: number
  type: ChatType
  name: string | null
  created_at: Date
  updated_at: Date
}

export interface Peep {
  id: number
  chat_id: number
  sender_id: number
  content: string
  created_at: Date
  is_edited: boolean
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

export interface addPeepDTO {
  validIds: {
    chatId: number
  }
  validData: {
    content: string
  }
}

export interface findPeepsDTO {
  search: string
}

export interface editPeepDTO {
  validIds: {
    peepId: number
  }
  validData: {
    content: string
  }
}
export interface deletePeepDTO {
  validIds: {
    peepId: number
  }
}

export interface typingDTO {
  validIds: {
    chatId: number  
  }
}
