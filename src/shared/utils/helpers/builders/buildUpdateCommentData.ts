import type { updateCommentMiddlewareDTO } from 'interfaces/commentInterfaces'

export const buildUpdateCommentData = (
  data: updateCommentMiddlewareDTO,
  fields: string[],
  values: string[]
) => {
  let i = 2
  if (data.content) {
    fields.push(`content = $${i++}`)
    values.push(data.content)
  }
}
