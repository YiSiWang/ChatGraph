import { encrypt } from '@/utils/encrypt'
import type { APIRoute } from 'astro'

export const post: APIRoute = async(context) => {
  const body = await context.request.json()
  const { key, text } = body
  return new Response(encrypt(key, text))
}
