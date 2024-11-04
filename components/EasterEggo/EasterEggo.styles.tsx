import { css, keyframes } from '@emotion/react';

const slideInAnimation = keyframes`
  0% {
    transform: translate(100%);
  }
  100% {
    transform: translate(0);
  }
`;

export const containerStyles = css`
  position: absolute;
  display: flex;
  bottom: 0;
  right: 0;
  transform: translate(100%);
  animation-name: ${slideInAnimation};
  animation-duration: 200ms;
  animation-timing-function: ease-in-out;
  animation-play-state: running;
  animation-fill-mode: forwards;
  animation-direction: normal;
  z-index: 2147483647;
`;

export const imageStyles = css`
  width: 250px;
  height: 250px;
`;
