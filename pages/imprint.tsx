import styled from '@emotion/styled';
import tw from 'twin.macro';

import { Layout } from '@layouts/index';

const Container = tw.div`
	flex flex-grow min-h-screen
	pt-16 pb-12
`;

const Content = tw.div`
	flex-grow flex flex-col justify-center max-w-md sm:max-w-2xl w-full
	mx-auto px-0 sm:px-12
`;

const EventCard = tw.div`
	relative flex flex-col space-x-3
	bg-gray-900 bg-opacity-75
	backdrop-filter backdrop-blur-sm
	px-2 py-3
	border-2 border-gray-600
	rounded-lg
`;

const sectionStyle = tw`
  first-line:font-semibold text-white
  block
  m-2
`;

const Title = styled.h1`
  ${sectionStyle}
  mb-4 text-2xl
`;

const Address = styled.address`
  ${sectionStyle}
`;

const Section = styled.div`
  ${sectionStyle}
`;

export default function ImprintPage() {
  return (
    <Layout.Default seo={{ title: 'daniel.heene.io ─ imprint' }}>
      <Container>
        <Content>
          <EventCard>
            <Title>Imprint</Title>
            <Address>
              Daniel Heene
              <br />
              Von-Sparr-Str. 62
              <br />
              51063 Cologne
              <br />
              Germany
            </Address>
            <Section>
              Contact:
              <br />
              call: +49 221 22206571
              <br />
              mail: website@heene.io
            </Section>
            <Section>
              VAT ID:
              <br />
              DE348610586
            </Section>
          </EventCard>
        </Content>
      </Container>
    </Layout.Default>
  );
}
