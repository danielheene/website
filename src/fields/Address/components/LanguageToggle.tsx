import { cn } from '@/lib/cn'

interface LanguageToggleProps {
  currentLanguage: string
  setLanguage: (locale: string) => void
}

export const LanguageToggle = ({ currentLanguage, setLanguage }: LanguageToggleProps) => {
  return (
    <button
      type="button"
      className={cn(
        'btn btn--style-secondary h-8 w-12 p-0 m-0 bg-white text-primary font-mono relative',
      )}
      onClick={() => {
        const nextLocale = [
          'en',
          'de',
        ].find((locale) => locale !== currentLanguage)
        setLanguage(nextLocale)
      }}
    >
      <span
        className={cn([
          'absolute top-0 left-0.5',
          currentLanguage === 'en' ? 'text-primary' : 'text-gray-400',
        ])}
      >
        EN
      </span>
      <span
        className={cn([
          'absolute left-1/2 top-1/2 px-1',
          '-translate-1/2 bg-white rotate-30',
          "before:content-[''] before:block before:w-[2px] before:h-[1.25em] before:bg-primary",
        ])}
      />
      <span
        className={cn([
          'absolute bottom-0 right-0.5',
          currentLanguage === 'de' ? 'text-primary' : 'text-gray-400',
        ])}
      >
        DE
      </span>
    </button>
  )
}
