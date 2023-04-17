import { onCleanup, onMount } from 'solid-js'
import { generateData } from '@/utils/mock'
import IconX from './icons/X'

const { G6 } = globalThis as any

const GraphCanvas = () => {
  let divRef: HTMLDivElement
  let dialogRef: HTMLDialogElement

  onMount(() => {
    const graphData = generateData()
    const graph = new G6.Graph({
      container: divRef,
      width: divRef.clientWidth,
      height: divRef.clientHeight,
      modes: {
        default: ['drag-canvas', 'drag-node', 'click-select', 'zoom-canvas'],
      },
      maxZoom: 2,
      minZoom: 0.5,
      layout: {
        type: 'random',
      },
      animate: false,
    })
    graph.data(graphData)
    graph.render()
    graph.once('afterlayout', () => {
      graph.destroyLayout()
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const showDialog = () => {
      dialogRef.showModal()
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const exportFile = (filename: string, content: string) => {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = url
      link.download = filename
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
    }

    const listener = (event: CustomEvent<{ code: string }>) => {
      // eslint-disable-next-line no-eval
      eval(event.detail.code)
    }
    window.addEventListener('RUN_CODE', listener)
    onCleanup(() => {
      window.removeEventListener('RUN_CODE', listener)
    })
  })

  const hideDialog = () => {
    dialogRef.close()
  }

  return (
    <>
      <div class="graph-canvas h-full w-full bg-gray-100" ref={divRef} />
      <dialog ref={dialogRef}>
        <div onClick={hideDialog} class="absolute top-0 right-0 cursor-pointer scale-125">
          <IconX />
        </div>
        <div id="dialog-container" class="max-h-xl w-4xl" />
      </dialog>
    </>
  )
}

export default GraphCanvas
