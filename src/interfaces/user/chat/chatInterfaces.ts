export type ChatType = 'private' | 'group'

export type ChatAutoDeleteAfter =
  | null
  | '1 hour'
  | '1 day'
  | '1 week'
  | '1 month'

export interface Chat {
  id: number
  type: ChatType
  name: string | null
  created_at: Date
  updated_at: Date
  user_id?: number
  url_avatar?: string | null
  auto_delete_after: ChatAutoDeleteAfter
  auto_delete_enabled_at: Date | null
}

export interface ChatParticipant {
  id: number
  chat_id: number
  user_id: number
  joined_at: Date
  last_read_peep_id: number | null
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

export interface setAutoDeletePeepsDTO {
  validData: { interval: ChatAutoDeleteAfter }
  validIds: {
    chatId: number
  }
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

export interface markPeepsAsReadUpToDTO {
  validIds: {
    chatId: number
    peepId: number
  }
}
