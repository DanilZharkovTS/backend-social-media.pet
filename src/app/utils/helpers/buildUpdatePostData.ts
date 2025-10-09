import type { updatePostDTO } from "interfaces/postInterfaces";

export const buildUpdatePostData = (body: updatePostDTO, fields: string[], values: string[]) => {
  let i = 2
  if (body.description) {
    fields.push(`description = $${i++}`)
    values.push(body.description)
  }
}