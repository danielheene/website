import styled from '@emotion/styled';
import tw from 'twin.macro';
import type { ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface IconProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const Button = styled.button(tw`
	relative inline-block
	px-3 py-2
	bg-gray-700 hover:bg-gray-500
	text-gray-300 hover:text-white
	rounded-lg
	text-sm font-medium
	transition ease-in-out duration-100
	focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500
`);

export const Icon = forwardRef<HTMLButtonElement, IconProps>(
  ({ children, className, onClick, ...rest }, ref) => {
    return (
      <Button
        ref={ref}
        className={`group ${className}`}
        onClick={(e) => onClick && onClick(e)}
        {...rest}
      >
        {children}
      </Button>
    );
  }
);
