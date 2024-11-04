import React, { useCallback } from 'react';
import { Button, Grid, Stack } from '@sanity/ui';
import { Icon } from '@iconify/react';
import { set, unset, StringInputProps } from 'sanity';

type Position = 'left' | 'center' | 'right';

const IconButton = ({
  icon,
  selected,
  position,
  onClick = () => undefined,
}: {
  icon: string;
  selected: boolean;
  position?: Position;
  onClick?: (position: Position) => void;
}) => (
  <Button
    mode='ghost'
    type='button'
    selected={selected}
    justify='center'
    onClick={() => onClick(position)}
    style={{
      textAlign: 'center',
      alignItems: 'center',
      fontSize: '1.5rem',
      lineHeight: 0,
      cursor: 'pointer',
    }}
    fontSize={40}
    textAlign='center'
    data-position={position}
  >
    <Icon icon={icon} />
  </Button>
);

export const ImagePosition = (props: StringInputProps) => {
  const { onChange, value = '', elementProps } = props;

  const handleClick = useCallback(
    (position: Position) => onChange(position ? set(position) : unset()),
    [onChange]
  );

  return (
    <Stack space={0}>
      <Grid columns={3} gap={0}>
        <IconButton
          position='left'
          onClick={handleClick}
          icon='gridicons:align-image-left'
          selected={value === 'left'}
        />
        <IconButton
          position='center'
          onClick={handleClick}
          icon='gridicons:align-image-center'
          selected={value === 'center'}
        />
        <IconButton
          position='right'
          onClick={handleClick}
          icon='gridicons:align-image-right'
          selected={value === 'right'}
        />
      </Grid>
    </Stack>
  );
};
