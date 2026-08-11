'use client'

import React from 'react'
import ReactDOM from 'react-dom'

import { useUmami } from '../contexts/Umami'

const audioContents = [
  'SUQzAwAAAAAAIVRFTkMAAAAIAAAARmlzc2lvblRMRU4AAAAFAAAAMTE4OP/7mMQAAAAAAAAAAA',
  'AAAAAAAAAAAFhpbmcAAAADAAAAIQAAMKgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  'AAAAAAAAAAAP/7GMQAA8AAAaQAAAAgAAA0gAAABPA////////l/b/+UW22XSmnQ8LRcHBE4DAe',
  'fYjCUpjjy3x+0Iy5HfYe667U48+19LwQM/WFhx13uOBi0Xv/D3AkaZ8XDhB4huwYRT09uc/haB',
  'yKVS+UPWVjPmBgAGAYIbrYasd1ykwaZGIDZY8FVbmVS80uUtwSsjbWPv/7GMQ9g8AAAaQAAAAg',
  'AAA0gAAABJMOZ///8rYI7ljfOfjnSuise/2fpObLiEJKGf0fR+7/d//9F2jdQKAQITQCAAABAP',
  '/ttscvP0a/GgZbk8YeBoY2FuY9ASY3BcYkFYRBOJDYYkCeKAAYiBoYSAQYKgEIQsCoRLGNfCDE',
  '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',
  'gP4zuY7Q1jVrjxDn5sfsZAtOACk6ASASOiwLNhQ8HpBh8reHQsp4HMOXVo3rQxKbBP/IG/7T3/',
  'a8p9CLa9CgAD/YBEJjgSW/ZLOtFhhmJlUUa6eK9QTK7nJhdiQiABC5d0FT7qPCydj7P17MNbki',
  'EyCAmLpFl6xIAV4r35coc2zMh0IBwaBAhpl+gcEmG5TLh7lTJ1GXwaDZ1ha7DeNyDnMjOSyjah',
  'y3fSOlt+8zM+5TPjwrUJ+Ix0ycit6+eZQ4RuHeWTT/ceNvObv/r/0KMAAAAGfyQ4gM0hFDESGv',
  '8rqH0RQRPOcRRILhKuS+SGSKYM19fBeplTUnuo87L7Llfy/Uev/7WMQaApIItyNNYSnCQRbkKY',
  'elqNFUiwrSuxAKpSwWMQ9Tqxv+0CQo7q51Uk7QCqvMIcoREQKiUMQD4pHUJSSyktNUyyDJY7F+',
  'F1s20Q5bTZAXOqMqCR0NRUctShCbaCxsGAEcDzv/936Kf////2i6CI/2wUGoQAnPHg6LSDCRH8',
  'wgZWyBDab0iUJN05i3HVPphbGNKl9Ja4K6UmQ8gF0SrgTpaxBXTShsDBuqhHJ2AMjqK0NLuass',
  'CQIoCbUyVJNzMorTgaZJhEjQHyVa1m3gsLPaoDCRpUVK1ETLipM6dFgKWJAX+do63doMzynkRE',
  '+s6eInctrdzo931P2aiIl+imsMjUMDscj/RPYxQQqGTLvFRapMQU1FMy4xMDCqqv/7GMQPA8JI',
  'SPwBgExAAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqTEFNRTMuMTAwqqqqqqqqqqqqqv/7GMRDA8AAAaQAAAAgAAA0gAAABKqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuMTAwqqqqqqqqqq',
  'qqqv/7GMSAg8AAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqTEFNRTMuMTAwqqqqqqqqqqqqqv/7GMS+A8AAAaQAAAAgAAA0gAAA',
  'BKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMu',
  'MTAwqqqqqqqqqqqqqv/7GMTCA8AAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqTEFNRTMuMTAwqqqqqqqqqqqqqv/7GMTCA8AAAa',
  'QAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7GMTCA8AAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qv/7GMTCA8AAAaQAAAAgAAA0gAAABKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7GMTCA8AAAaQAAAAgAAA0gAAABK',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
  'qqqqqqqqqqqqqqqg==',
]

const imageContents = [
  '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',
  'UClTKj4a/BmsqLsnwAAA==',
]

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
  code: [
    ...keySequence,
  ],
  imageBlob: undefined,
  audioBuffer: undefined,
})

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.Reset:
      return {
        ...state,
        code: [
          ...initialState.code,
        ],
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

export const Toasty = function Toasty(): React.JSX.Element {
  const { track } = useUmami()
  const audioContextRef = React.useRef<AudioContext>(null)
  const keyEventBoundRef = React.useRef<boolean>(false)
  const [{ success, imageBlob, audioBuffer }, dispatch] = React.useReducer(reducer, initialState)

  const handleKeyUpEvent = React.useCallback((event: KeyboardEvent): void => {
    dispatch({
      type: ActionType.KeyUp,
      payload: event.key,
    })
  }, [])

  /**
   *    Binds the konami-code listener once for the component's lifetime.
   *    handleKeyUpEvent is a useCallback with no dependencies, so it is stable,
   *    and the effect never re-runs.
   */
  React.useEffect(() => {
    if (!keyEventBoundRef.current) {
      window.addEventListener('keyup', handleKeyUpEvent)
      keyEventBoundRef.current = true
      printHintMessage()
    }

    return (): void => {
      if (keyEventBoundRef.current) {
        window.removeEventListener('keyup', handleKeyUpEvent)
        keyEventBoundRef.current = false
      }
    }
  }, [
    handleKeyUpEvent,
  ])

  /**
   *
   */
  React.useEffect((): void => {
    if (success && !audioBuffer) {
      audioContextRef.current = new AudioContext()

      const audioData = `data:audio/mpeg;base64,${audioContents.join('')}`

      fetch(audioData)
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
  }, [
    audioBuffer,
    success,
  ])

  /**
   *
   */
  React.useEffect((): void => {
    if (success && !imageBlob) {
      const imageData = `data:image/webp;base64,${imageContents.join('')}`

      fetch(imageData)
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
  }, [
    imageBlob,
    success,
  ])

  /**
   *
   */
  React.useEffect(() => {
    if (audioBuffer && imageBlob && success) {
      track('Toasty!!')

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
  }, [
    audioBuffer,
    imageBlob,
    success,
    track,
  ])

  /**
   *
   */
  if (!audioBuffer || !imageBlob || !success) return null

  return ReactDOM.createPortal(
    <React.Fragment>
      <div className="toasty" aria-hidden={true} tabIndex={-1}>
        {/** biome-ignore lint/performance/noImgElement: <TODO> */}
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
            image-rendering: pixelated;
          }
        `}
      </style>
    </React.Fragment>,
    document.body,
  )
}
