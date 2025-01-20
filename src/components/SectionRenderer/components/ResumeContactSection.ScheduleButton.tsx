'use client'

import { useEffect } from 'react'
import { getCalApi } from '@calcom/embed-react'
import { SectionProps } from '@custom-types'

type ResumeContactSectionScheduleButtonProps = SectionProps<'resumeContact'>['scheduleButton']

export const ResumeContactSectionScheduleButton = ({
  label,
  href,
}: ResumeContactSectionScheduleButtonProps) => {
  const calLink = new URL(href).pathname
  const calNamespace = calLink.split('/')[1]

  useEffect(() => {
    ;(async function () {
      const cal = await getCalApi({ namespace: calNamespace })
      cal('ui', {
        // https://github.com/calcom/cal.com/blob/b0ca7dae1a17f897e34b83c990f30ab65f615ee0/packages/config/tailwind-preset.js#L69
        cssVarsPerTheme: { light: { 'cal-brand': '#111791' }, dark: { 'cal-brand': '#6168F6' } },
        hideEventTypeDetails: false,
        layout: 'month_view',
      })
    })()
  }, [])

  return (
    <button
      data-cal-namespace={calNamespace}
      data-cal-link={calLink}
      data-cal-config='{"layout":"month_view"}'
    >
      {label || 'Schedule Appointment'}
    </button>
  )
}
