import type { Accessor } from 'solid-js'

interface ReceivedMessageProps {
  content: Accessor<string> | string
}

function parseContent(content: string) {
  const parts = content.split(/(```js|```)/)
  const isCodeBlock = (i: number) => i % 4 === 2
  const result: { type: 'text' | 'code', value: string }[] = []

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === '```js' || parts[i] === '```') continue

    if (isCodeBlock(i))
      result.push({ type: 'code', value: parts[i] })
    else
      result.push({ type: 'text', value: parts[i] })
  }

  return result
}

const ReceivedMessage = (props: ReceivedMessageProps) => {
  const contentParts = () => parseContent(typeof props.content === 'string' ? props.content : props.content())

  const execute = (code: string) => {
    window.dispatchEvent(new CustomEvent<{ code: string }>('RUN_CODE', { detail: { code } }))
  }

  return (
    <div class="received-message-container flex justify-start mb-2">
      <div class="received-message bg-gray-300 text-gray-900 rounded-md px-3 py-2 max-w-3/4 whitespace-pre-wrap">
        {contentParts().map((part) => {
          return part.type === 'code'
            ? (
              <div class="relative">
                <pre class="bg-gray-100 p-2 rounded-md overflow-auto max-h-[280px]">{part.value}</pre>
                <button class="absolute top-1 right-1 bg-lime-600 text-white px-2 py-1 rounded-md" onClick={() => execute(part.value)}>
                  Execute
                </button>
              </div>
              )
            : (
                part.value
              )
        })}
      </div>
    </div>
  )
}

export default ReceivedMessage
