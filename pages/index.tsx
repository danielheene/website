import styled from '@emotion/styled';
import tw from 'twin.macro';
import { differenceInYears, isSameDay, isSameMonth } from 'date-fns';
import { Icon } from '@iconify/react';

import { Button } from '@components/Button';
import { Event } from '@components/Event.component';
import { Pill } from '@components/Pill';
import { Transition } from '@components/index';
import { Wave } from '@components/Wave.styles';
import type { NavigationItem } from '@typings/navigation';
import { NavigationItemType } from '@typings/navigation';
import { EventType } from '@typings/events';
import { Layout } from '@layouts/index';
import React from 'react';
import { HireMeMemoji } from '@components/HireMeMemoji';
import { GetStaticProps } from 'next';

const Container = tw.div`
	min-h-screen flex items-center justify-center
	py-12
`;

const Content = tw.div`
	max-w-md sm:max-w-lg md:sm:max-w-2xl lg:sm:max-w-3xl w-full space-y-8
	text-center
`;

const Title = tw.h1`
	text-white
	text-5xl sm:text-6xl md:text-6xl lg:text-8xl
	tracking-tight font-extrabold
`;

const Description = tw.p`
	max-w-xs
	mt-4 md:mt-8 mx-auto
	text-base text-gray-300 sm:text-lg md:text-xl md:max-w-3xl font-semibold
`;

const LineBreak = tw.br`
	hidden sm:block
`;

const StyledPill = tw(Pill.Standard)`
	mt-4
`;

const Actions = styled.div`
  ${tw`
		flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-4 sm:space-y-0 w-full \
		mt-8 sm:mt-4
	`}
  div {
    ${tw`
			w-full sm:w-auto
		`}
  }
`;

const ActionIcon = tw(Icon)`
	mr-3
`;

const ActionText = tw.span`
	my-0 py-1
`;

const ACTIONS: Array<NavigationItem> = [
  {
    type: NavigationItemType.LINK,
    external: true,
    href: 'https://github.com/danielheene',
    icon: <ActionIcon icon='simple-icons:github' />,
    text: 'GitHub',
  },
  {
    type: NavigationItemType.LINK,
    external: true,
    href: 'mailto:daniel@heene.io',
    icon: <ActionIcon icon='feather:mail' />,
    text: 'Hire Me!',
  },
  {
    type: NavigationItemType.LINK,
    external: true,
    href: 'https://de.linkedin.com/in/danielheene',
    icon: <ActionIcon icon='simple-icons:linkedin' />,
    text: 'LinkedIn',
  },
];

interface Props {
  hireMe: boolean;
}

export default function HomePage({ hireMe }: Props) {
  const today = new Date();
  const birthday = new Date('1988-04-17');
  const age = differenceInYears(today, birthday);
  const isBirthday = isSameDay(today, birthday) && isSameMonth(today, birthday);

  return (
    <Layout.Default>
      {isBirthday && <Event event={EventType.BIRTHDAY} />}
      <Container>
        <Content>
          <Transition duration={1000}>
            <Title>
              Hey <Wave>👋</Wave> I'm Daniel, <LineBreak />a{' '}
              <StyledPill>developer</StyledPill>
            </Title>
          </Transition>
          <Transition delay={500} duration={1000}>
            <Description>
              I am a {age} year old javascript engineer & modular synthesizer
              enthusiast.
            </Description>
          </Transition>

          <Actions>
            {ACTIONS.map((action, index) => {
              if (action.type !== NavigationItemType.LINK) return null;

              return (
                <Transition
                  delay={1000 + index * 100}
                  key={index}
                  duration={1000}
                >
                  <Button.Outline href={action.href}>
                    {action.icon}
                    <ActionText>{action.text}</ActionText>
                  </Button.Outline>
                </Transition>
              );
            })}
          </Actions>
        </Content>
        {hireMe && <HireMeMemoji />}
      </Container>
    </Layout.Default>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await fetch('https://api.github.com/repos/danielheene/danielheene/topics', {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  const { names: topics } = await response.json();

  return {
    props: {
      hireMe: topics.includes('hire-me'),
    },
    revalidate: 60 * 60 * 24,
  };
};
