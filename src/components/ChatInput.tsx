import { createSignal } from 'solid-js'
import IconClear from './icons/Clear'

interface ChatInputProps {
  disabled: boolean
  onClear: () => void
  onSendMessage: (message: string) => void
}

const ChatInput = (props: ChatInputProps) => {
  const [message, setMessage] = createSignal('')

  const handleSendMessage = () => {
    props.onSendMessage(message())
    setMessage('')
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.isComposing || e.shiftKey)
      return

    if (e.key === 'Enter') {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div class="gen-text-wrapper px">
      <textarea
        class="gen-textarea"
        rows="1"
        placeholder="Type your message here..."
        value={message()}
        onInput={(e: any) => setMessage(e.target.value)}
        onKeyDown={handleKeydown}
      />
      <button
        class={props.disabled ? 'cursor-not-allowed' : ''}
        gen-slate-btn
        disabled={props.disabled}
        onClick={handleSendMessage}
      >
        Send
      </button>
      <button title="Clear" onClick={props.onClear} gen-slate-btn>
        <IconClear />
      </button>
    </div>
  )
}

export default ChatInput
