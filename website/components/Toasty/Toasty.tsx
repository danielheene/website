import React, { memo, useEffect, useReducer, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useCreatePortalHost } from '@lib/hooks';
import { log } from 'next-axiom';

enum ActionType {
  KeyUp = 'Toasty/KeyUp',
  Reset = 'Toasty/Reset',
  SetBuffer = 'Toasty/SetBuffer',
  SetImage = 'Toasty/SetImage',
}

type Action =
  | {
      type: `${ActionType.KeyUp}`;
      payload: string;
    }
  | {
      type: `${ActionType.Reset}`;
    }
  | {
      type: `${ActionType.SetBuffer}`;
      payload: AudioBuffer;
    }
  | {
      type: `${ActionType.SetImage}`;
      payload: string;
    };

type State = {
  success: boolean;
  code: string[];
  buffer?: AudioBuffer;
  image?: string;
};

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
];

export const initialState: State = Object.freeze<State>({
  success: false,
  code: [...keySequence],
  image: undefined,
  buffer: undefined,
});

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ActionType.Reset:
      return {
        ...state,
        code: [...initialState.code],
        success: initialState.success,
      };

    case ActionType.KeyUp:
      if (action.payload === state.code[0]) {
        return {
          ...state,
          success: state.code.length === 1,
          code: state.code.slice(1),
        };
      }

      return {
        ...state,
        success: initialState.success,
        code: initialState.code,
      };

    case ActionType.SetBuffer:
      return {
        ...state,
        buffer: action.payload,
      };

    case ActionType.SetImage:
      return {
        ...state,
        image: action.payload,
      };

    default:
      return state;
  }
};

const printHintMessage = (): void =>
  console.info(
    '\n%c' +
      '                                                \n' +
      '    you are familiar with video games? 🎮       \n' +
      '    good luck on finding that easter egg! 😉    \n' +
      '                                                \n',
    `
          background: #000;
          color: #fff;
          font-size: 120%;
          font-weight: bold;
          padding: 0 10px;
        `
  );

interface ToastyProps {
  audioPath: string;
  imagePath: string;
}

let eventIsRegistered = false;
const PORTAL_ID = 'ToastyPortal';
export const Toasty = memo(
  ({ imagePath, audioPath }: ToastyProps): JSX.Element => {
    const audioContextRef = useRef<AudioContext>();
    const portalRef = useCreatePortalHost<HTMLDivElement>(PORTAL_ID);
    const [{ success, image, buffer }, dispatch] = useReducer(
      reducer,
      initialState
    );

    /**
     *
     */
    useEffect((): (() => void) => {
      const handleKeyUpEvent = (event: KeyboardEvent): void => {
        dispatch({
          type: ActionType.KeyUp,
          payload: event.key,
        });
      };

      setTimeout((): void => {
        if (!eventIsRegistered) {
          eventIsRegistered = true;
          window.addEventListener('keyup', handleKeyUpEvent, false);
          printHintMessage();
        }
      }, 0);

      return (): void => {
        if (eventIsRegistered) {
          eventIsRegistered = false;
          window.removeEventListener('keyup', handleKeyUpEvent, false);
        }
      };
    }, []);

    /**
     *
     */
    useEffect((): void => {
      if (success && !buffer) {
        audioContextRef.current = new AudioContext();

        fetch(audioPath)
          .then((response) => response.arrayBuffer())
          .then((arrayBuffer) =>
            audioContextRef.current!.decodeAudioData(arrayBuffer)
          )
          .then((audioBuffer) => {
            dispatch({
              type: ActionType.SetBuffer,
              payload: audioBuffer,
            });
          })
          .catch((error: Error) => {
            log.error(
              'failed to load easter egg audio 😔\n',
              error.message
            );
          });
      }
    }, [audioPath, buffer, success]);

    /**
     *
     */
    useEffect((): void => {
      if (!image) {
        fetch(imagePath)
          .then(() => {
            dispatch({
              type: ActionType.SetImage,
              payload: imagePath,
            });
          })
          .catch((error: Error) => {
            log.error(
              'failed to load easter egg image 😔\n',
              error.message
            );
          });
      }
    }, [image, imagePath]);

    /**
     *
     */
    useEffect(() => {
      if (buffer && image && success) {
        const audioBuffer = audioContextRef.current!.createBufferSource();
        audioBuffer.buffer = buffer;
        audioBuffer.onended = () => {
          dispatch({
            type: ActionType.Reset,
          });
        };
        audioBuffer.connect(audioContextRef.current!.destination);
        audioBuffer.start(0);
      }
    }, [buffer, image, success]);

    if (!buffer || !image || !success || !portalRef.current) return null;

    return ReactDOM.createPortal(
      <React.Fragment>
        <div className='toasty' aria-hidden={true} tabIndex={-1}>
          <img src={image} alt='' />
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
      portalRef.current
    );
  }
);
