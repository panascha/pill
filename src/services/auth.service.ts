import { supabase } from './supabase'
import type { DrugRole } from '../lib/types/database.types'

const ALLOWED_DOMAIN = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN as string | undefined

export interface CurrentUser {
  id: string
  email: string
  role: DrugRole
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  const session = data.session
  if (!session) return null

  if (ALLOWED_DOMAIN && !session.user.email?.endsWith(ALLOWED_DOMAIN)) {
    await signOut()
    throw new Error(`กรุณาใช้อีเมล ${ALLOWED_DOMAIN} เท่านั้น`)
  }

  return {
    id: session.user.id,
    email: session.user.email ?? '',
    role: (session.user.app_metadata?.user_role as DrugRole) ?? 'student',
  }
}

export function onAuthStateChange(
  callback: (user: CurrentUser | null) => void
): { unsubscribe: () => void } {
  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session) {
      callback(null)
      return
    }
    if (ALLOWED_DOMAIN && !session.user.email?.endsWith(ALLOWED_DOMAIN)) {
      await signOut()
      callback(null)
      return
    }
    callback({
      id: session.user.id,
      email: session.user.email ?? '',
      role: (session.user.app_metadata?.user_role as DrugRole) ?? 'student',
    })
  })
  return data.subscription
}
