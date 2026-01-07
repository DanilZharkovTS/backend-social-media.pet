export interface addPostInterface {
  name: string
  description: string
}

export interface paginationDTO {
  page: number
  limit: number
  offset: number
}

export interface updatePostDTO {
  description?: string
  fields?: string[]
  values?: string[]
}

export interface findPostDTO {
  search?: string
}