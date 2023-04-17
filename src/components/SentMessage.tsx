interface SentMessageProps {
  content: string
}

const SentMessage = (props: SentMessageProps) => {
  return (
    <div class="sent-message-container flex justify-end mb-2">
      <div class="sent-message bg-blue-500 text-white rounded-md px-3 py-2 max-w-3/4 whitespace-pre-wrap">
        {props.content}
      </div>
    </div>
  )
}

export default SentMessage
