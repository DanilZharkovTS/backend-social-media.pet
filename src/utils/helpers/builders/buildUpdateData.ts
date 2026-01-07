import type { updateMyInfoDTO } from '../../../interfaces/user/userInterfaces.ts'

export const buildUpdateData = {
  myInfo: (
    data: updateMyInfoDTO,
    fields: string[],
    values: string[] & Date[]
  ) => {
    let i = 2
    if (data.name) {
      fields.push(`name = $${i++}`)
      values.push(data.name)
    }
    if (data.bio) {
      fields.push(`bio = $${i++}`)
      values.push(data.bio)
    }
    if (data.birth_date) {
      fields.push(`birth_date = $${i++}`)
      values.push(data.birth_date)
    }
  },
}
