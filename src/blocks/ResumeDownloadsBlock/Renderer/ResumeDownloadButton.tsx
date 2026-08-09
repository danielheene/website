import Link from 'next/link'

import { Button } from '@/components/Button'

export const ResumeDownloadButton = ({
  url,
  fileName,
  locale,
  label,
  subline,
}: {
  url: string
  fileName: string
  locale: string
  label: string
  subline: string
}) => {
  return (
    <Button
      variant="ghost"
      className="uppercase bg-card text-card-foreground border-border font-mono px-4 py-2 h-auto"
      asChild
    >
      <Link href={url} download={fileName}>
        <div className="flex items-center gap-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-card-foreground/80"
            viewBox="0 0 124 124"
          >
            {locale === 'en' && (
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M121 68v50h-8L98 84v34h-8V68h8l15 34V68Zm-39 8H59v13h20v7H59v14h23v8H51V68h31Z"
              />
            )}
            {locale === 'de' && (
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M121 76H98v13h20v7H98v14h23v8H90V68h31Zm-52.8-8q3.69 0 6.84 1.9a14 14 0 0 1 4.99 5.06A14 14 0 0 1 82 82v22c0 2.52-.74 4.86-1.97 7a14 14 0 0 1-5 5.1 13 13 0 0 1-6.84 1.9H51V68zm-.2 42c1.26 0 3.12-1.1 4-2s2-3.76 2-5V83c0-1.29-.97-3.14-1.83-4.02C71.31 78.09 69.3 76 68 76h-9v34Z"
              />
            )}
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="m80.83 35.17-28-28A4 4 0 0 0 50 6H10a8 8 0 0 0-8 8v96a8 8 0 0 0 8 8h32v-8H10V14h32v24a8 8 0 0 0 8 8h24v16h8V38a4 4 0 0 0-1.17-2.83M50 15.66 72.34 38H50Z"
            />
          </svg>
          <div className="flex flex-col items-center gap-1 text-card-foreground">
            <span className="text-2xl leading-none font-medium tracking-tighter">{label}</span>
            <span className="text-xs leading-none  opacity-80">{subline}</span>
          </div>
        </div>
      </Link>
    </Button>
  )
}
