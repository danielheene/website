import styled from '@emotion/styled';
import tw from 'twin.macro';
import { Icon } from '@iconify/react';

import type { WithChildren } from '@typings/common';

interface DatePillProps extends WithChildren {
  small?: boolean;
  ongoing?: boolean;
}

const Container = styled.div<{ small: boolean; ongoing: boolean }>`
  ${tw`
		inline-flex justify-center w-full sm:w-auto \
		bg-primary-500 bg-opacity-15 \
		backdrop-filter backdrop-blur-sm saturate-200 \
		rounded-lg  font-semibold \
		text-sm text-primary-500
	`}

  ${({ small }) => (small ? tw`px-2 py-1` : tw`px-4 py-2`)}
  ${({ ongoing }) =>
    ongoing
      ? tw`bg-green-500  bg-opacity-15 text-green-500`
      : tw`bg-primary-500  bg-opacity-15  text-primary-500`}
`;

export function DatePill({ children, small, ongoing }: DatePillProps) {
  return (
    <Container small={small} ongoing={ongoing}>
      <Icon
        css={[tw`mt-0.5`, small ? tw`mr-1.5` : tw`mr-3`]}
        icon='feather:calendar'
      />
      {children}
    </Container>
  );
}
