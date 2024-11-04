import React, { PropsWithoutRef } from 'react';
import { Badge, Flex } from '@sanity/ui';
import { get } from 'lodash';
import { SanityDefaultPreview } from 'sanity';

export const SanityPreviewWithPublishedLabel = (
  props: PropsWithoutRef<Record<string, unknown>>
) => {
  const published = get(props, 'value.published', true);
  const style = { opacity: published ? 1 : 0.5 };

  return (
    <Flex justify='space-between'>
      <div style={style}>
        <SanityDefaultPreview {...props} />
      </div>
      <Flex align='center' paddingRight={2}>
        <Badge mode='outline' tone={published ? 'positive' : undefined}>
          {published ? 'Published' : 'Hidden'}
        </Badge>
      </Flex>
    </Flex>
  );
};
