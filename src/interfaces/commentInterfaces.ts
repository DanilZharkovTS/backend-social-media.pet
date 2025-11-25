export interface addCommentDTO {
  content: string
}

export interface deleteCommentDTO {
  name: string
}

export interface updateCommentMiddlewareDTO {
  content?: string
}

export interface updateCommentDTO {
  fields: string[]
  values: string[]
}