export interface User {
  id: number
  email: string
  password: string
  name: string
  created_at: Date
  role: 'user' | 'admin'
  birth_date: Date | null
  bio: string | null
  avatar_url: string | null
  email_is_verified: boolean
  has_checkmark: boolean
  stripe_customer_id: string | null
  last_notification_read_at: Date | null
}

export interface updateMyInfoDTO {
  name?: string
  bio?: string | null
  birth_date?: Date | null
}

export interface dynamicUpdateMyInfo {
  fields: string[]
  values: string[] & Date[]
}

export interface updateAvatarUrlDTO {
  avatar_url: string
}

export interface updatePassword {
  oldPassword: string
  newPassword: string
}

export interface updateEmail {
  password: string
  newEmail: string
}
