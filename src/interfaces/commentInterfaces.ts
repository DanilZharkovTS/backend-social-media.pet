export interface addCommentDTO {
  name: string
  content: string
}

export interface deleteCommentDTO {
  name: string
}

export interface updateCommentMiddlewareDTO {
  name: string
  content?: string
}

export interface updateCommentDTO {
  name: string
  fields: string[]
  values: string[]
}