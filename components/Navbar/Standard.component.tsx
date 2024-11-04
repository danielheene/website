import styled from '@emotion/styled';
import tw from 'twin.macro';
import { Disclosure } from '@headlessui/react';

import { Dropdown } from './Dropdown.component';
import { Icon } from './Icon.component';
import { Button } from '@components/Button';
import { menuItems } from '@lib/index';
import React from 'react';

const StyledDisclosure = styled(Disclosure)(tw`
	fixed top-0 left-0 w-full z-10
`);

const Container = styled.div(tw`
	mx-auto px-2
`);

const Content = styled.div(tw`
	relative flex items-center justify-between h-16
`);

export function Standard() {
  return (
    <StyledDisclosure as='nav'>
      <Container>
        <Content>
          <Dropdown items={menuItems} position='top-left'>
            <Button.Icon aria-label='Menu'>
              <Icon icon='feather:menu' />
            </Button.Icon>
          </Dropdown>
        </Content>
      </Container>
    </StyledDisclosure>
  );
}
