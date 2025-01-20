'use client'

import React, { JSX, memo, useEffect, useReducer, useRef } from 'react'
import ReactDOM from 'react-dom'
import { useCreatePortalHost } from '@/utilities/useCreatePortalHost'

enum ActionType {
  KeyUp = 'Toasty/KeyUp',
  Reset = 'Toasty/Reset',
  SetBuffer = 'Toasty/SetBuffer',
  SetImage = 'Toasty/SetImage',
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
      type: `${ActionType.SetBuffer}`
      payload: AudioBuffer
    }
  | {
      type: `${ActionType.SetImage}`
      payload: string
    }

type State = {
  success: boolean
  code: string[]
  buffer?: AudioBuffer
  image?: string
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
  image: undefined,
  buffer: undefined,
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

    case ActionType.SetBuffer:
      return {
        ...state,
        buffer: action.payload,
      }

    case ActionType.SetImage:
      return {
        ...state,
        image: action.payload,
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

let eventIsRegistered = false
const PORTAL_ID = 'ToastyPortal'

const imagePath = new URL('./static/image.webp', import.meta.url)
const audioPath = new URL('./static/audio.mp3', import.meta.url)

export const Toasty = memo((): JSX.Element => {
  const audioContextRef = useRef<AudioContext>(null)
  const portalRef = useCreatePortalHost(PORTAL_ID)
  const [{ success, image, buffer }, dispatch] = useReducer(reducer, initialState)

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
      eventIsRegistered = true
      window.addEventListener('keyup', handleKeyUpEvent)
      printHintMessage()
    }

    return (): void => {
      if (eventIsRegistered) {
        eventIsRegistered = false
        window.removeEventListener('keyup', handleKeyUpEvent)
      }
    }
  }, [])

  /**
   *
   */
  useEffect((): void => {
    if (success && !buffer) {
      audioContextRef.current = new AudioContext()

      fetch(audioPath)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioContextRef.current.decodeAudioData(arrayBuffer))
        .then((audioBuffer) => {
          dispatch({
            type: ActionType.SetBuffer,
            payload: audioBuffer,
          })
        })
        .catch((error: Error) => {
          console.error('failed to load easter egg audio 😔\n', error.message)
        })
    }
  }, [buffer, success])

  /**
   *
   */
  useEffect((): void => {
    fetch(imagePath)
      .then(() => {
        dispatch({
          type: ActionType.SetImage,
          payload: imagePath.toString(),
        })
      })
      .catch((error: Error) => {
        console.error('failed to load easter egg image 😔\n', error.message)
      })
  }, [])

  /**
   *
   */
  useEffect(() => {
    if (buffer && image && success) {
      const audioBuffer = audioContextRef.current.createBufferSource()
      audioBuffer.buffer = buffer
      audioBuffer.onended = () => {
        dispatch({
          type: ActionType.Reset,
        })
      }
      audioBuffer.connect(audioContextRef.current.destination)
      audioBuffer.start(0)
    }
  }, [buffer, image, success])

  if (!buffer || !image || !success || !portalRef.current) return null

  return ReactDOM.createPortal(
    <React.Fragment>
      <div className="toasty" aria-hidden={true} tabIndex={-1}>
        <img src={image} alt="" />
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
})

Toasty.displayName = 'Toasty'

export default Toasty
