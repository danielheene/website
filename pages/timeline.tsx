import styled from '@emotion/styled';
import tw from 'twin.macro';
import { format, parse } from 'date-fns';
import { Icon } from '@iconify/react';

import { Pill } from '@components/Pill';
import { Layout } from '@layouts/index';

import type { GetStaticProps } from 'next';

import type { Timeline, TimelineEvent } from '@typings/timeline';

interface TimelineProps {
  timeline?: Timeline;
}

const Container = tw.div`
	flex flex-grow min-h-screen
	pt-16 pb-12
`;

const Content = tw.div`
	flex-grow flex flex-col justify-center max-w-lg sm:max-w-4xl w-full
	mx-auto px-0 sm:px-16
`;

const List = tw.ul`
	-mb-8
`;

const ListItem = tw.li`
	my-1
`;

const ListItemContainer = tw.div`
	relative
	pb-8
`;

const TimelineConnector = tw.span`
	absolute top-1 left-1/2 w-0.5 h-full
	-ml-px
	bg-gray-600
`;

const EventCard = tw.div`
	relative flex flex-col space-x-3
	bg-gray-900 bg-opacity-75
	backdrop-filter backdrop-blur-sm
	px-2 py-3
	border-2 border-gray-600
	rounded-lg
`;

const EventIconContainer = tw.div`
	relative flex items-center justify-center w-12 h-12
	bg-primary-500 bg-opacity-15
	backdrop-filter backdrop-blur-sm saturate-200
	mx-2 px-2 self-start
	rounded-full
`;

const EventIcon = tw(Icon)`
	w-6 h-6
	text-primary-500
`;

const EventHeader = tw.header`
  flex flex-row items-center justify-start
  mb-2
`;

const EventBody = tw.div`
	min-w-0 flex-1
`;

const Title = styled.h1`
  ${tw`
		flex flex-wrap justify-start items-center
		text-white
		ml-2
		text-lg tracking-tight font-bold
	`}
  div {
    ${tw`mt-2 sm:mt-0`}
  }
`;

const DateContainer = tw.div`
  inline-flex flex-row justify-end items-center whitespace-nowrap mb-2 self-end ml-auto
`;

const Description = tw.p`
	my-2
	text-gray-300
	text-base
	font-semibold
`;

const EventLinkButton = tw.a`
	p-1
	ml-2
	opacity-50 hover:opacity-100
`;

const EventLinkButtonIcon = tw(Icon)`
	m-0
`;

const TagContainer = tw.div`
  flex flex-row flex-wrap mt-2
`;

const Tag = tw.span`
  inline-flex items-center justify-center
  py-1 px-2  my-0.5 last:mr-0.5 mr-1
  text-xs font-semibold
  uppercase rounded text-primary-500
  bg-primary-500 bg-opacity-15 backdrop-filter backdrop-blur-sm saturate-200
`;

export const getStaticProps: GetStaticProps<TimelineProps> = async () => {
  const { default: rawTimeline } = await import('@data/timeline.json');
  const timeline = (rawTimeline as Array<TimelineEvent>).sort((a, b) => {
    if (!('end' in b)) return +1; // keep ongoing events at the top
    return +new Date(b.start) - +new Date(a.start);
  });

  return {
    props: {
      timeline,
    },
  };
};

export default function TimelinePage({ timeline: rawTimeline }: TimelineProps) {
  const timeline = rawTimeline.map((event) => ({
    ...event,
    // Note: Custom parser needed as Safari on iOS doesn't like the standard `new Date()` parsing
    start: parse(event?.start?.toString(), 'yyyy-MM-dd', new Date()),
    end:
      'end' in event
        ? parse(event?.end?.toString(), 'yyyy-MM-dd', new Date())
        : 0,
  }));

  return (
    <Layout.Default seo={{ title: 'daniel.heene.io ─ timeline' }}>
      <Container>
        <Content>
          <List role='list'>
            {timeline.map((event, index) => (
              <ListItem key={event.title}>
                <ListItemContainer tw=''>
                  {index !== timeline.length - 1 ? (
                    <TimelineConnector aria-hidden='true' />
                  ) : null}

                  <EventCard>
                    <EventHeader>
                      <EventIconContainer>
                        <EventIcon icon={event.icon} aria-hidden='true' />
                      </EventIconContainer>
                      <Title>
                        <span>{event.title}</span>
                        {event.link && (
                          <EventLinkButton
                            href={event.link}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <EventLinkButtonIcon icon='feather:external-link' />
                          </EventLinkButton>
                        )}
                      </Title>
                      <DateContainer>
                        <Pill.Date small={true} ongoing={event.end === 0}>
                          {event?.end === 0 ? 'Since ' : ''}
                          {event?.start && format(event.start, 'LL/yyyy')}
                        </Pill.Date>
                      </DateContainer>
                    </EventHeader>

                    <EventBody>
                      {event.description.map((paragraph, index) => (
                        <Description
                          key={index}
                          dangerouslySetInnerHTML={{ __html: paragraph }}
                        />
                      ))}
                    </EventBody>
                    {event.tags && (
                      <TagContainer>
                        {event.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </TagContainer>
                    )}
                  </EventCard>
                </ListItemContainer>
              </ListItem>
            ))}
          </List>
        </Content>
      </Container>
    </Layout.Default>
  );
}
