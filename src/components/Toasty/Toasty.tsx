'use client'

import React, { JSX, useEffect, useReducer, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { track } from '@vercel/analytics'
import { data as ToastyAudioData, mime as ToastyAudioMime } from './Toasty.audio'
import { data as ToastyImageData, mime as ToastyImageMime } from './Toasty.image'
import { useCreatePortalHost } from '@/utilities/useCreatePortalHost'

enum ActionType {
  KeyUp = 'Toasty/KeyUp',
  Reset = 'Toasty/Reset',
  SetAudioBuffer = 'Toasty/SetAudioBuffer',
  SetImageBlob = 'Toasty/SetImageBlob',
}

type Action =
  | {
      type: `${ActionType.KeyUp}`
      payload: string
    }
  | {
      type: `${ActionType.Reset}`
    }
  | {
      type: `${ActionType.SetAudioBuffer}`
      payload: AudioBuffer
    }
  | {
      type: `${ActionType.SetImageBlob}`
      payload: Blob
    }

type State = {
  success: boolean
  code: string[]
  audioBuffer?: AudioBuffer
  imageBlob?: Blob
}

const keySequence: KeyboardEvent['key'][] = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
  // 'Enter',
]

export const initialState: State = Object.freeze<State>({
  success: false,
  code: [...keySequence],
  imageBlob: undefined,
  audioBuffer: undefined,
})

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.Reset:
      return {
        ...state,
        code: [...initialState.code],
        success: initialState.success,
      }

    case ActionType.KeyUp:
      if (action.payload === state.code[0]) {
        return {
          ...state,
          success: state.code.length === 1,
          code: state.code.slice(1),
        }
      }

      return {
        ...state,
        success: initialState.success,
        code: initialState.code,
      }

    case ActionType.SetAudioBuffer:
      return {
        ...state,
        audioBuffer: action.payload,
      }

    case ActionType.SetImageBlob:
      return {
        ...state,
        imageBlob: action.payload,
      }

    default:
      return state
  }
}

const printHintMessage = (): void => {
  console.info(
    '\n%c' +
      '                                                    \n' +
      '                                                    \n' +
      '     You played video games back in the 90s? 🎮     \n' +
      '     Then good luck in finding the easter egg! 😉   \n' +
      '                                                    \n' +
      '                                                    \n',
    `
          background: #000;
          color: #fff;
          font-size: 120%;
          font-weight: bold;
          padding: 0 10px;
        `,
  )
}

const imagePath = `data:${ToastyImageMime};base64,${ToastyImageData}`
const audioPath = `data:${ToastyAudioMime};base64,${ToastyAudioData}`

export const Toasty = function Toasty(): JSX.Element {
  const audioContextRef = useRef<AudioContext>(null)
  const portalRef = useCreatePortalHost('ToastyPortal')
  const [eventIsRegistered, setEventIsRegistered] = useState(false)
  const [{ success, imageBlob, audioBuffer }, dispatch] = useReducer(reducer, initialState)

  /**
   *
   */
  useEffect(() => {
    const handleKeyUpEvent = (event: KeyboardEvent): void => {
      dispatch({
        type: ActionType.KeyUp,
        payload: event.key,
      })
    }

    if (eventIsRegistered === false) {
      window.addEventListener('keyup', handleKeyUpEvent)
      printHintMessage()
      setEventIsRegistered(true)
    }

    return (): void => {
      if (eventIsRegistered) {
        setEventIsRegistered(false)
        window.removeEventListener('keyup', handleKeyUpEvent)
      }
    }
  }, [])

  /**
   *
   */
  useEffect((): void => {
    if (success && !audioBuffer) {
      audioContextRef.current = new AudioContext()

      fetch(audioPath)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioContextRef.current.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          dispatch({
            type: ActionType.SetAudioBuffer,
            payload: audioBuffer,
          })
        })
        .catch((error: Error) => {
          console.error('failed to load easter egg audio 😔\n', error.message)
        })
    }
  }, [audioBuffer, success])

  /**
   *
   */
  useEffect((): void => {
    if (success && !imageBlob) {
      fetch(imagePath)
        .then((response) => response.blob())
        .then((imageBlob) => {
          dispatch({
            type: ActionType.SetImageBlob,
            payload: imageBlob,
          })
        })
        .catch((error: Error) => {
          console.error('failed to load easter egg image 😔\n', error.message)
        })
    }
  }, [imageBlob, success])

  /**
   *
   */
  useEffect(() => {
    if (audioBuffer && imageBlob && success) {
      track('toasty', {
        success: success,
      })

      const audioBufferNode = audioContextRef.current.createBufferSource()

      audioBufferNode.buffer = audioBuffer
      audioBufferNode.onended = () => {
        dispatch({
          type: ActionType.Reset,
        })
      }
      audioBufferNode.connect(audioContextRef.current.destination)
      audioBufferNode.start(0)
    }
  }, [audioBuffer, imageBlob, success])

  if (!audioBuffer || !imageBlob || !success || !portalRef.current) return null

  return ReactDOM.createPortal(
    <React.Fragment>
      <div className="toasty" aria-hidden={true} tabIndex={-1}>
        <img src={URL.createObjectURL(imageBlob)} alt="toasty" />
      </div>
      <style jsx>
        {`
          @keyframes slideInAnimation {
            0% {
              transform: translate(100%);
            }
            100% {
              transform: translate(0);
            }
          }

          .toasty {
            position: fixed;
            display: flex;
            bottom: 0;
            right: 0;
            animation: slideInAnimation 200ms ease-in-out forwards;
            z-index: 2147483647;
            pointer-events: none;
            user-select: none;
          }

          .toasty img {
            width: 250px;
            height: 250px;
          }
        `}
      </style>
    </React.Fragment>,
    portalRef.current,
  )
}
