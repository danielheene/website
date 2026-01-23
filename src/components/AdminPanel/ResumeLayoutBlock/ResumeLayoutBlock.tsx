import { cn } from '@/utilities/cn'
import Link from 'next/link'
import { memo } from 'react'

export interface ResumeLayoutBlockProps {
  imageSrc: string
  editHref: string
  backgroundColor: 'primary' | 'white'
}

export const ResumeLayoutBlock = memo(({ imageSrc, editHref, backgroundColor = 'white' }: ResumeLayoutBlockProps) => (
  <div className={cn('relative  group/resume-layout-block')}>
    <div
      className={cn([
        'w-full opacity-100 grayscale-0',
        backgroundColor === 'white' && 'bg-white',
        backgroundColor === 'primary' && 'bg-primary',
        'transition-all duration-300 delay-150',
        'group-hover/resume-layout-block:delay-0',
        'group-hover/resume-layout-block:opacity-10',
        'group-hover/resume-layout-block:grayscale-100',
      ])}
    >
      <img className={cn(['aspect-16-9 max-h-[500px] mx-auto'])} src={imageSrc} role="presentation" alt="" />
    </div>
    <div
      className={cn([
        'absolute inset-0 opacity-0',
        'transition-all duration-300 delay-0',
        'group-hover/resume-layout-block:delay-150',
        'group-hover/resume-layout-block:opacity-100',
        'flex flex-col items-center justify-center p-5',
        'text-center font-mono font-semibold lg:text-xl',
      ])}
    >
      <span>This is just a placeholder for the page layout.</span>
      {editHref && (
        <span>
          You can edit the content of this section{' '}
          <Link href={editHref} target="_blank">
            here
          </Link>
          .
        </span>
      )}
    </div>
  </div>
))
