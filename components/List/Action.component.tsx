import styled from '@emotion/styled';
import tw from 'twin.macro';
import { css } from '@emotion/react';

const ButtonStyles = css`
  ${tw`
		relative inline-flex justify-center w-full sm:w-10 h-10 \
		px-3 py-2 \
		bg-gray-900 hover:bg-gray-700 \
		text-gray-400 hover:text-white \
		border border-gray-500 \
		rounded-lg \
		text-sm font-medium \
		transition ease-in-out duration-300
		focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500
	`}
  svg {
    ${tw`
			mt-1
		`}
  }
`;

export const Button = styled.button(ButtonStyles);

export const Link = styled.a(ButtonStyles);
