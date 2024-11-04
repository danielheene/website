import Image from 'next/image';
import tw from 'twin.macro';
import React from 'react';
import ReactDOM from 'react-dom';
import { css, keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const MemojiContainer = tw.div`
  w-64 h-64
  flex flex-col justify-center items-center
  absolute bottom-0 left-0
`;

const MemojiImage = tw(Image)`
  opacity-0
`;

const MemojiContent = tw.div`
  w-full h-full
  relative
`;

const SpeechBubble = tw.a`
  absolute left-3/4 top-1/2
  bg-primary-500 text-white
  flex justify-center items-center
  w-56 h-12 rounded-md
  font-semibold
  opacity-0

  after:content-[' '] after:w-0 after:h-0
  after:absolute after:right-full after:top-3/4 after:-translate-y-full
  after:border-t-[10px] after:border-t-transparent
  after:border-b-[5px] after:border-b-transparent
  after:border-r-[20px] after:border-r-primary-500
`;

const fadeInImage = css`
  opacity: 0;
  animation: ${fadeIn} 0.3s ease-in-out;
  animation-fill-mode: forwards;
`;

const fadeInText = css`
  opacity: 0;
  animation: ${fadeIn} 0.3s ease-in-out;
  animation-fill-mode: forwards;
  animation-delay: 0.5s;
`;

export const HireMeMemoji = (): React.ReactElement => {
  const portalRef = React.useRef<HTMLDivElement>(null);
  const [showMemoji, setShowMemoji] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!portalRef.current) {
      const portal = document.createElement('div');
      portal.classList.add('MemojiPortal');
      document.body.appendChild(portal);
      portalRef.current = portal;
    }
  }, []);

  React.useEffect(() => {
    if (window && window.innerWidth > 700 && window.innerHeight > 700) {
      setTimeout(() => {
        setShowMemoji(true);
      }, 3000);
    }
  }, []);

  return showMemoji && portalRef.current
    ? ReactDOM.createPortal(
        <MemojiContainer>
          <MemojiContent>
            <MemojiImage
              css={[fadeInImage]}
              src='/memoji_whisper.webp'
              width={500}
              height={500}
              onAnimationEnd={() => setImageLoaded(true)}
            />
            <SpeechBubble
              css={[imageLoaded && fadeInText]}
              href='mailto:daniel@heene.io'
            >
              I am available for hiring!
            </SpeechBubble>
          </MemojiContent>
        </MemojiContainer>,
        portalRef.current
      )
    : null;
};
