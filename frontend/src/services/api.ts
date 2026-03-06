const getAuthHeaders = (): Record<string, string> => ({
    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
    'x-pubkey': sessionStorage.getItem('pubkey') ?? '',
})

export interface UserProfile {
    id: string
    pubkey: string
    display_name: string
    name: string
    picture: string
    about?: string
    balance: number
}

export async function getMe(): Promise<UserProfile> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile')
    return res.json() as Promise<UserProfile>
}
