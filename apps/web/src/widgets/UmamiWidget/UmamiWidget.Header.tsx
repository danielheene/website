'use client'

import Link from 'next/link'

import { formatDate } from 'date-fns'

import { Button } from '@/components/Button'
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ButtonGroup'
import { Icon } from '@/components/Icon'
import { Skeleton } from '@/components/Skeleton'
import { cn } from '@repo/utils/cn'

interface HeaderProps {
  domain: string | null
  name: string | null
  umamiUrl: string
  startDate: Date
  endDate: Date
  onOpenModal: () => void
  onMoveInterval: (direction: 1 | -1) => void
}

export const Header = ({
  domain,
  name,
  umamiUrl,
  startDate,
  endDate,
  onOpenModal,
  onMoveInterval,
}: HeaderProps) => {
  if (!domain && !name) {
    return <Skeleton className='h-12 w-full"' />
  }

  return (
    <>
      <div
        className={cn([
          'flex flex-col',
          'font-mono',
        ])}
      >
        <div className="text-xs md:text-sm lg:text-md text-muted-foreground">Umami Controls:</div>
        <Link
          className="text-md md:text-lg lg:text-xl no-underline font-medium leading-none"
          href={umamiUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{name}</span>
        </Link>
      </div>

      <div className="flex flex-row gap-2.5">
        <ButtonGroup>
          <Button
            variant="secondary"
            typeof="button"
            size="icon-lg"
            onClick={() => onMoveInterval(-1)}
          >
            <Icon name="arrow-left" />
          </Button>
          <ButtonGroupSeparator />
          <Button
            variant="secondary"
            typeof="button"
            size="icon-lg"
            onClick={() => onMoveInterval(1)}
          >
            <Icon name="arrow-right" />
          </Button>
        </ButtonGroup>
        <Button variant="secondary" type="button" size="lg" onClick={onOpenModal}>
          {formatDate(startDate, 'dd/MM/yyyy')}
          {' - '}
          {formatDate(endDate, 'dd/MM/yyyy')}
        </Button>
      </div>
    </>
  )
}
