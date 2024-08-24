import { JSX } from 'react'
import { Page } from '@payload-types'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/cn'
import dayjs from 'dayjs'

type ITimelineBlockProps = Required<Extract<Page['layout'][0], { blockType: 'timelineBlock' }>> & {
  className: string
}

export const TimelineBlock = ({
  blockType,
  entries,
  caption,
  title,
  className,
}: ITimelineBlockProps): JSX.Element => {
  return (
    <section className={className} data-theme="light">
      <div className={cn('container', 'px-4', 'py-12', 'mx-auto')}>
        <div className={cn('grid', 'gap-4', 'mx-4', 'sm:grid-cols-12')}>
          <div className={cn('col-span-12', 'sm:col-span-3')}>
            <div
              className={cn(
                'text-center',
                'sm:text-left',
                'mb-14',
                'sm:before:mx-0',
                'before:block',
                'before:w-24',
                'before:h-3',
                'before:mb-5',
                'before:rounded-md',
                'before:mx-auto',
                'before:dark:bg-violet-600',
              )}
            >
              <h2 className={cn('text-4xl', 'font-supply-mono', 'text-primary')}>{title}</h2>
              <RichText
                className={cn(
                  'text-sm',
                  'font-bold',
                  'tracking-wider',
                  'uppercase',
                  'dark:text-gray-600',
                )}
                content={caption}
                enableGutter={false}
              />
            </div>
          </div>

          <div className={cn('relative', 'col-span-12', 'px-4', 'space-y-6', 'sm:col-span-9')}>
            <div
              className={cn(
                'col-span-12',
                'relative',
                'px-4',
                'sm:col-span-7',
                'sm:before:absolute',
                'sm:before:top-2',
                'sm:before:bottom-0',
                'sm:before:w-0.5',
                'sm:before:-left-3',
              )}
            >
              {entries.map(({ id, title, employer, startDate, endDate, richText }) => (
                <article
                  key={id}
                  className={cn(
                    'flex',
                    'flex-col',
                    'py-12',
                    'sm:relative',
                    'sm:before:absolute',
                    'sm:before:top-2',
                    'sm:before:w-4',
                    'sm:before:h-4',
                    'sm:before:rounded-full',
                    'sm:before:left-[-35px]',
                    'sm:before:z-[1]',
                  )}
                >
                  <header
                    className={cn([
                      'flex',
                      'flex-row',
                      'flex-nowrap',
                      'justify-between',
                      'text-primary',
                      'font-supply-mono',
                      'mb-4'
                    ])}
                  >
                    <div className={cn(['flex', 'flex-col', 'flex-shrink'])}>
                      <h3 className={cn('text-2xl')}>{title}</h3>
                      <h4>{employer}</h4>
                    </div>
                    <div
                      className={cn([
                        'flex',
                        'flex-col',
                        'flex-nowrap',
                        'shrink',
                        'justify-center',
                        'lg:flex-row',
                        'lg:justify-end',
                        'text-sm',
                        'uppercase',
                        'whitespace-nowrap',
                      ])}
                    >
                      <time dateTime={startDate}>{dayjs(startDate).format('MMM YYYY')}</time>
                      <span>&nbsp;&nbsp;-&nbsp;&nbsp;</span>
                      <time dateTime={endDate}>{dayjs(endDate).format('MMM YYYY')}</time>
                    </div>
                  </header>
                  <RichText content={richText} enableGutter={false} className='w-full' />
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
