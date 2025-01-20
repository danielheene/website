import { SectionData } from '@custom-types'
import { SectionNavigationProvider } from './components/SectionNavigationProvider'
import { SectionNavigation } from './components/SectionNavigation'
import { ResumeHeroSection } from './components/ResumeHeroSection'
import { ResumeAboutMeSection } from './components/ResumeAboutMeSection'
import { ResumeExperienceSection } from './components/ResumeExperienceSection'
import { ResumeProjectsSection } from './components/ResumeProjectsSection'
import { ResumeCustomersSection } from './components/ResumeCustomersSection'
import { ResumeContactSection } from './components/ResumeContactSection'

interface SectionRendererProps {
  sections: Array<
    | SectionData<'resumeHero'>
    | SectionData<'resumeAboutMe'>
    | SectionData<'resumeExperience'>
    | SectionData<'resumeProjects'>
    | SectionData<'resumeCustomers'>
    | SectionData<'resumeContact'>
  >
}

export const SectionRenderer = ({ sections }: SectionRendererProps) => {
  return (
    <SectionNavigationProvider>
      <SectionNavigation key="anchor-nav" />

      {sections.map((sectionData) => {
        const k = [sectionData.globalType, sectionData.id].join('-')

        switch (sectionData.globalType) {
          case 'resumeHero':
            return <ResumeHeroSection key={k} {...sectionData} />
          case 'resumeAboutMe':
            return <ResumeAboutMeSection key={k} {...sectionData} />
          case 'resumeExperience':
            return <ResumeExperienceSection key={k} {...sectionData} />
          case 'resumeProjects':
            return <ResumeProjectsSection key={k} {...sectionData} />
          case 'resumeCustomers':
            return <ResumeCustomersSection key={k} {...sectionData} />
          case 'resumeContact':
            return <ResumeContactSection key={k} {...sectionData} />
          default:
            return null
        }
      })}
    </SectionNavigationProvider>
  )
}
