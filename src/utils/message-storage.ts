import question1 from '../messages/question1.txt?raw'
import question2 from '../messages/question2.txt?raw'
import question3 from '../messages/question3.txt?raw'
import question4 from '../messages/question4.txt?raw'
import response1 from '../messages/response1.txt?raw'
import response2 from '../messages/response2.txt?raw'
import response3 from '../messages/response3.txt?raw'
import response4 from '../messages/response4.txt?raw'

export const BUIT_IN_MESSAGES = [
  {
    type: 'sent' as const,
    content: question1,
  },
  {
    type: 'received' as const,
    content: response1,
  },
  {
    type: 'sent' as const,
    content: question2,
  },
  {
    type: 'received' as const,
    content: response2,
  },
  {
    type: 'sent' as const,
    content: question3,
  },
  {
    type: 'received' as const,
    content: response3,
  },
  {
    type: 'sent' as const,
    content: question4,
  },
  {
    type: 'received' as const,
    content: response4,
  },
]

export const getStoredMessages = () => {
  try {
    return JSON.parse(localStorage.getItem('messages')) || null
  } catch {
    return null
  }
}

export const setStoredMessages = (messages?: Array<{ type: 'sent' | 'received', content: string }>) => {
  if (!messages) {
    localStorage.removeItem('messages')
    return
  }
  try {
    localStorage.setItem('messages', JSON.stringify(messages))
  } catch (error) {
    console.error(error)
  }
}
