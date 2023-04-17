// #vercel-disable-blocks
import { ProxyAgent, fetch } from 'undici'
// #vercel-end
import { generatePayload, parseOpenAIStream } from '@/utils/openAI'
import { verifySignature } from '@/utils/auth'
import { decrypt } from '@/utils/encrypt'
import encryptedPrompt from './encryptedPrompt.txt?raw'
import type { APIRoute } from 'astro'
import type { ChatMessage } from '@/types'

const apiKey = import.meta.env.OPENAI_API_KEY
const encryptKey = import.meta.env.ENCRYPT_KEY
const httpsProxy = import.meta.env.HTTPS_PROXY
const baseUrl = ((import.meta.env.OPENAI_API_BASE_URL) || 'https://api.openai.com').trim().replace(/\/$/, '')
const sitePassword = import.meta.env.SITE_PASSWORD || ''
const passList = sitePassword.split(',') || []

interface Params {
  sign: string
  time: number
  messages: ChatMessage[]
  pass: string
}

export const post: APIRoute = async(context) => {
  const body = await context.request.json()
  const { sign, time, messages, pass } = body as Params
  if (!messages) {
    return new Response(JSON.stringify({
      error: {
        message: 'No input text.',
      },
    }), { status: 400 })
  }
  if (sitePassword && !(sitePassword === pass || passList.includes(pass))) {
    return new Response(JSON.stringify({
      error: {
        message: 'Invalid password.',
      },
    }), { status: 401 })
  }
  if (import.meta.env.PROD && !await verifySignature({ t: time, m: messages?.[messages.length - 1]?.content || '' }, sign)) {
    return new Response(JSON.stringify({
      error: {
        message: 'Invalid signature.',
      },
    }), { status: 401 })
  }
  if (messages.length > 10) {
    return new Response(JSON.stringify({
      error: {
        message: '暂不支持超过10次对话，请清空会话后重试。',
      },
    }), { status: 405 })
  }

  const prompt = decrypt(encryptKey, encryptedPrompt)

  const initOptions = generatePayload(apiKey, [
    {
      role: 'system',
      content: prompt,
    },
    ...messages.map((msg) => {
      return {
        role: msg.role,
        content: msg.content,
      }
    }),
  ])
  // #vercel-disable-blocks
  if (httpsProxy)
    initOptions.dispatcher = new ProxyAgent(httpsProxy)
  // #vercel-end

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const response = await fetch(`${baseUrl}/v1/chat/completions`, initOptions).catch((err: Error) => {
    console.error(err)
    return new Response(JSON.stringify({
      error: {
        code: err.name,
        message: err.message,
      },
    }), { status: 500 })
  }) as Response

  return parseOpenAIStream(response) as Response
}
