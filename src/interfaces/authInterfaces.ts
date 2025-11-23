


export interface TokenPayload {
  userId: number
  email: string
}

export interface registerUserDTO {
  email: string
  password: string
  name: string
}

export interface loginUserDTO {
  email: string
  password: string
}