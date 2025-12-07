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
