export const urlBuilder = {
  accountInviteUrl: (token: string) => {
    const inviteUrl = `${process.env.FRONTEND_URL}/auth/invite?token=${token}`
    return { inviteUrl }
  },
}
