export interface Post {
  id: number
  user_id: number
  description: string
  created_at: Date
  likes_count: number
}

export interface PostLike {
  id: number
  user_id: number
  post_id: number
  created_at: Date
}

export interface PostFavorite {
  id: number
  user_id: number
  post_id: number
  created_at: Date
}

export interface addPostInterface {
  description: string
}

export interface paginationDTO {
  page: number
  limit: number
  offset: number
  start: number
  end: number
}

export interface updatePostDTO {
  description?: string
  fields?: string[]
  values?: string[]
}

export interface findPostDTO {
  search?: string
}
