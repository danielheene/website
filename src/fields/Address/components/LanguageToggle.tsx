import { cn } from 'tailwind-variants'

interface LanguageToggleProps {
  currentLanguage: string
  setLanguage: (locale: string) => void
}

export const LanguageToggle = ({ currentLanguage, setLanguage }: LanguageToggleProps) => {
  return (
    <button
      type="button"
      className={cn(
        'btn btn--style-secondary relative m-0 h-8 w-12 bg-white p-0 font-mono text-primary',
      )}
      onClick={() => {
        const nextLocale = ['en', 'de'].find((locale) => locale !== currentLanguage)
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
          'absolute top-1/2 left-1/2 px-1',
          '-translate-1/2 rotate-30 bg-white',
          "before:block before:h-[1.25em] before:w-[2px] before:bg-primary before:content-['']",
        ])}
      />
      <span
        className={cn([
          'absolute right-0.5 bottom-0',
          currentLanguage === 'de' ? 'text-primary' : 'text-gray-400',
        ])}
      >
        DE
      </span>
    </button>
  )
}
