import { createSignal, onMount } from 'solid-js'
import { generateSignature } from '@/utils/auth'
import { BUIT_IN_MESSAGES, getStoredMessages, setStoredMessages } from '@/utils/message-storage'
import ChatInput from './ChatInput'
import ReceivedMessage from './ReceivedMessage'
import SentMessage from './SentMessage'
import ErrorMessageItem from './ErrorMessageItem'
import IconRefresh from './icons/Refresh'
import type { ErrorMessage } from '@/types'

const ChatContainer = () => {
  const [messages, setMessages] = createSignal<Array<{ type: 'sent' | 'received', content: string }>>(BUIT_IN_MESSAGES)
  const [receivingMessage, setReceivingMessage] = createSignal<null | string>(null)
  const [currentError, setCurrentError] = createSignal<null | ErrorMessage>(null)
  const [controller, setController] = createSignal<AbortController>(null)

  onMount(() => {
    const storedMessages = getStoredMessages()
    storedMessages && setMessages(storedMessages)
  })

  const handleSendMessage = async(message: string) => {
    setMessages([...messages(), { type: 'sent', content: message }])
    await requestWithLatestMessage()
  }

  const handleClearMessage = () => {
    if (receivingMessage()) return
    setMessages([])
    setStoredMessages()
    setCurrentError(null)
  }

  const requestWithLatestMessage = async() => {
    setReceivingMessage('')
    setCurrentError(null)
    const storagePassword = localStorage.getItem('pass')
    try {
      const controller = new AbortController()
      setController(controller)
      const requestMessageList = [...messages().map(msg => ({
        role: msg.type === 'sent' ? 'user' : 'assistant',
        content: msg.content,
      }))]
      const timestamp = Date.now()
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: requestMessageList,
          time: timestamp,
          pass: storagePassword,
          sign: await generateSignature({
            t: timestamp,
            m: requestMessageList?.[requestMessageList.length - 1]?.content || '',
          }),
        }),
        signal: controller.signal,
      })
      if (!response.ok) {
        const error = await response.json()
        console.error(error.error)
        setCurrentError(error.error)
        throw new Error('Request failed')
      }
      const data = response.body
      if (!data)
        throw new Error('No data')

      const reader = data.getReader()
      const decoder = new TextDecoder('utf-8')
      let done = false

      while (!done) {
        const { value, done: readerDone } = await reader.read()
        if (value) {
          const char = decoder.decode(value)
          if (char === '\n' && receivingMessage().endsWith('\n'))
            continue

          if (char)
            setReceivingMessage(receivingMessage() + char)
        }
        done = readerDone
      }
    } catch (e) {
      console.error(e)
      if (e.name !== 'AbortError' && !currentError()) setCurrentError({ code: '0000', message: e.message })
      setController(null)
      setReceivingMessage(null)
      return
    }
    archiveReceivingMessage()
  }

  const archiveReceivingMessage = () => {
    if (receivingMessage()) {
      const newMessages = [
        ...messages(),
        {
          type: 'received' as const,
          content: receivingMessage(),
        },
      ]
      setMessages(newMessages)
      setStoredMessages(newMessages)
      setReceivingMessage(null)
      setController(null)
    }
  }

  const retryLastFetch = () => {
    if (messages().length > 0) {
      const lastMessage = messages()[messages().length - 1]
      if (lastMessage.type === 'received')
        setMessages(messages().slice(0, -1))

      requestWithLatestMessage()
    }
  }

  const stopStreamFetch = () => {
    if (controller()) {
      controller().abort()
      archiveReceivingMessage()
    }
  }

  const disabled = () => {
    return Boolean(currentError() || receivingMessage() !== null)
  }

  return (
    <section class="chat-container w-1/3 h-full border-l border-gray-300 flex flex-col">
      <div class="chat-messages-container flex-1 overflow-y-auto p-4">
        {messages().map(message =>
          message.type === 'sent'
            ? (
              <SentMessage content={message.content} />
              )
            : (
              <ReceivedMessage content={message.content} />
              ),
        )}
        {receivingMessage() && (
          <ReceivedMessage content={receivingMessage()} />
        )}
        {messages()[messages().length - 1]?.type === 'received' && !receivingMessage() && (
          <div class="fi mb-2">
            <div onClick={retryLastFetch} class="gpt-retry-btn">
              <IconRefresh />
              <span>Regenerate</span>
            </div>
          </div>
        )}
        {currentError() && <ErrorMessageItem data={currentError()} onRetry={retryLastFetch} />}
        {controller() && (
          <div class="fi mb-2">
            <div onClick={stopStreamFetch} class="gpt-retry-btn">
              <IconRefresh />
              <span>Abort</span>
            </div>
          </div>
        )}
      </div>
      <ChatInput disabled={disabled()} onSendMessage={handleSendMessage} onClear={handleClearMessage} />
    </section>
  )
}

export default ChatContainer
