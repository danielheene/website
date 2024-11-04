import { useCallback, useEffect, useReducer, useRef } from 'react';
import ReactDOM from 'react-dom';
import NextImage from 'next/image';

import { initialState, reducer } from './EasterEggo.reducer';
import { containerStyles } from './EasterEggo.styles';
import { ActionType, Props } from './EasterEggo.types';

let eventIsRegistered = false;
export const EasterEggo = ({ imagePath, audioPath }: Props) => {
  const audioContext = useRef<AudioContext>();
  const portalRef = useRef<HTMLDivElement>();
  const [{ success, image, buffer }, dispatch] = useReducer(
    reducer,
    initialState
  );

  /**
   *
   */
  const handleKeyUpEvent = useCallback((event: KeyboardEvent) => {
    dispatch({
      type: ActionType.KeyUp,
      payload: event.key,
    });
  }, []);

  /**
   *
   */
  useEffect(() => {
    if (!portalRef.current && document) {
      portalRef.current = document.createElement('div');
      portalRef.current?.classList.add('ReactPortal');
      document.body.appendChild(portalRef.current);
    }

    return () => {
      if (portalRef.current) {
        document.body.removeChild(portalRef.current);
        portalRef.current = undefined;
      }
    };
  }, []);

  /**
   *
   */
  useEffect(() => {
    if (!eventIsRegistered) {
      eventIsRegistered = true;
      window.addEventListener('keyup', handleKeyUpEvent);
    }

    return () => {
      if (eventIsRegistered) {
        eventIsRegistered = false;
        window.removeEventListener('keyup', handleKeyUpEvent);
      }
    };
  }, [handleKeyUpEvent]);

  /**
   *
   */
  useEffect(() => {
    if (!buffer) {
      audioContext.current = new AudioContext();

      fetch(audioPath)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) =>
          audioContext.current!.decodeAudioData(arrayBuffer)
        )
        .then((audioBuffer) => {
          dispatch({
            type: ActionType.SetBuffer,
            payload: audioBuffer,
          });
        })
        .catch((error: Error) => {
          console.error('failed to load easter egg audio 😔\n', error.message);
        });
    }
  }, [audioPath, buffer]);

  /**
   *
   */
  useEffect(() => {
    if (!image) {
      fetch(imagePath)
        .then((response) => response.blob())
        .then((blob) => {
          dispatch({
            type: ActionType.SetImage,
            payload: URL.createObjectURL(blob),
          });
        })
        .catch((error: Error) => {
          console.error('failed to load easter egg image 😔\n', error.message);
        });
    }
  }, [image, imagePath]);

  /**
   *
   */
  useEffect(() => {
    if (buffer && image) {
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
    }
  }, [buffer, image]);

  /**
   *
   */
  useEffect(() => {
    if (buffer && image && success) {
      const audioBuffer = audioContext.current!.createBufferSource();
      audioBuffer.buffer = buffer;
      audioBuffer.onended = () => {
        dispatch({
          type: ActionType.Reset,
        });
      };
      audioBuffer.connect(audioContext.current!.destination);
      audioBuffer.start(0);
    }
  }, [buffer, image, success]);

  if (!buffer || !image || !success || !portalRef.current) return null;

  return ReactDOM.createPortal(
    <div css={containerStyles}>
      <NextImage src={image} width={250} height={250} />
    </div>,
    portalRef.current
  );
};
