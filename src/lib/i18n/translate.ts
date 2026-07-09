import { format } from 'date-fns'
import { get } from 'lodash-es'
import pupa from 'pupa'

import type { LanguageCode, LanguageProficiency, SkillType } from '@/types/payload'

import type { Locale } from './shared'

const translations = {
  en: {
    document: {
      title: 'Resume of {name}',
      footer: {
        generatedNotice: 'This document was automatically generated as\n{fileName}',
        pagination: 'Page {pageNumber} of {totalPages}',
      },
      workExperience: {
        headline: 'Work Experience',
      },
    },
    interval: {
      finished: '{startDate | MM}/{startDate | yyyy} - {endDate | MM}/{endDate | yyyy}',
      ongoing: 'since {startDate | MM}/{startDate | yyyy}',
    },
    language: {
      label: {
        singular: 'Language',
        plural: 'Languages',
      },
      name: {
        cs: 'Czech',
        da: 'Danish',
        de: 'German',
        en: 'English',
        es: 'Spanish',
        et: 'Estonian',
        fi: 'Finnish',
        fr: 'French',
        hu: 'Hungarian',
        ja: 'Japanese',
        lv: 'Latvian',
        lt: 'Lithuanian',
        no: 'Norwegian',
        it: 'Italian',
        nl: 'Dutch',
        pl: 'Polish',
        pt: 'Portuguese',
        ro: 'Romanian',
        ru: 'Russian',
        sk: 'Slovak',
        sl: 'Slovenian',
        sv: 'Swedish',
        uk: 'Ukrainian',
        zh: 'Chinese',
      } as Record<LanguageCode, string>,
      proficiency: {
        a1: 'A1: Beginner',
        a2: 'A2: Elementary',
        b1: 'B1: Intermediate',
        b2: 'B2: Upper-Intermediate',
        c1: 'C1: Advanced',
        c2: 'C2: Proficient',
      } as Record<LanguageProficiency, string>,
    },
    skill: {
      label: {
        singular: 'Skill',
        plural: 'Skills',
      },
      type: {
        programmingLanguages: 'Programming Languages',
        frameworksAndLibraries: 'Frameworks & Libraries',
        toolingAndPlatforms: 'Tooling & Platforms',
        testingAndQuality: 'Testing & Quality',
        architectureAndPatterns: 'Architecture & Patterns',
        methodologiesAndWorkingPractices: 'Methodologies & Working Practices',
      } as Record<SkillType, string>,
    },
  },
  de: {
    document: {
      title: 'Lebenslauf von {name}',
      footer: {
        generatedNotice: 'Diese Datei wurde automatisch generiert als\n{fileName}',
        pagination: 'Seite {pageNumber} von {totalPages}',
      },
      workExperience: {
        headline: 'Berufserfahrung',
      },
    },
    interval: {
      finished: '{startDate | MM}/{startDate | yyyy} - {endDate | MM}/{endDate | yyyy}',
      ongoing: 'seit {startDate | MM}/{startDate | yyyy}',
    },
    language: {
      label: {
        singular: 'Sprache',
        plural: 'Sprachen',
      },
      name: {
        cs: 'Tschechisch',
        da: 'Dänisch',
        de: 'Deutsch',
        en: 'Englisch',
        es: 'Spanisch',
        et: 'Estnisch',
        fi: 'Finnisch',
        fr: 'Französisch',
        hu: 'Ungarisch',
        ja: 'Japanisch',
        lv: 'Lettisch',
        lt: 'Litauisch',
        no: 'Norwegisch',
        it: 'Italienisch',
        nl: 'Niederländisch',
        pl: 'Polnisch',
        pt: 'Portugiesisch',
        ro: 'Rumänisch',
        ru: 'Russisch',
        sk: 'Slowakisch',
        sl: 'Slowenisch',
        sv: 'Schwedisch',
        uk: 'Ukrainisch',
        zh: 'Chinesisch',
      } as Record<LanguageCode, string>,
      proficiency: {
        a1: 'A1: Anfänger',
        a2: 'A2: Grundkenntnisse',
        b1: 'B1: Gute Kenntnisse',
        b2: 'B2: Fließend',
        c1: 'C1: Verhandlungssicher',
        c2: 'C2: Muttersprache',
      } as Record<LanguageProficiency, string>,
    },
    skill: {
      label: {
        singular: 'Qualifikation',
        plural: 'Qualifikationen',
      },
      type: {
        programmingLanguages: 'Programmiersprachen',
        frameworksAndLibraries: 'Frameworks & Libraries',
        toolingAndPlatforms: 'Tooling & Plattformen',
        testingAndQuality: 'Testing & Qualität',
        architectureAndPatterns: 'Architektur & Patterns',
        methodologiesAndWorkingPractices: 'Methoden & Arbeitsweise',
      } as Record<SkillType, string>,
    },
  },
}

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`

type StringPaths<T> = T extends string
  ? ''
  : T extends object
    ? {
        [K in Extract<keyof T, string>]: `${K}${DotPrefix<StringPaths<T[K]>>}`
      }[Extract<keyof T, string>]
    : never

export type TranslationKey = StringPaths<(typeof translations)[Locale]>

export const translate = (
  locale: 'en' | 'de',
  key: TranslationKey,
  values?: Record<string, string>,
) => {
  const template: string | null = get(translations[locale], key, null)

  if (!template) {
    console.warn(`Missing translation for key ${key}`)
    return key
  }

  return pupa(template, values || {}, {
    filters: {
      MM: (value: string) => format(value, 'MM'),
      dd: (value: string) => format(value, 'dd'),
      yyyy: (value: string) => format(value, 'yyyy'),
    },
  })
}
