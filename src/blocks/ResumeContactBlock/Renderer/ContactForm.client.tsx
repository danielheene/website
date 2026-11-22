'use client'

import { useActionState, useEffect, useId, useRef } from 'react'

import { cn } from 'tailwind-variants'

import { Button } from '@/components/Button'
import { type ContactFormState, submitContactForm } from '@/lib/actions/submitContactForm'
import { UmamiEvent } from '@/lib/umami/events'
import { track } from '@/lib/umami/track'

const initialState: ContactFormState = {
  status: 'idle',
}

// underlined fields, the label sitting above the value inside the same row
const inputStyles = cn(
  'w-full rounded-none border-0 border-b border-border bg-transparent px-0 pt-1 pb-3',
  'text-base placeholder:text-muted-foreground',
  'transition-colors outline-none',
  'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30',
  'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
)

export const ContactForm = () => {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const nameId = useId()
  const emailId = useId()
  const messageId = useId()
  const companyId = useId()

  useEffect(() => {
    if (state.status === 'success') {
      formRef.current?.reset()
    }
  }, [state.status])

  // every submission returns a new state object, so repeated errors count too
  useEffect(() => {
    if (state.status === 'idle') return

    track(UmamiEvent.ContactForm, {
      status: state.status,
      ...(state.status === 'error' && { reason: state.fieldErrors ? 'validation' : 'server' }),
    })
  }, [state])

  return (
    <form ref={formRef} action={formAction} noValidate className="flex flex-col gap-8 text-left">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={nameId}
          className="font-mono text-xs tracking-wide text-muted-foreground uppercase"
        >
          Name*
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          required
          maxLength={200}
          aria-invalid={Boolean(state.fieldErrors?.name)}
          aria-describedby={state.fieldErrors?.name ? `${nameId}-error` : undefined}
          className={inputStyles}
        />
        {state.fieldErrors?.name && (
          <p id={`${nameId}-error`} className="text-sm text-destructive">
            {state.fieldErrors.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={emailId}
          className="font-mono text-xs tracking-wide text-muted-foreground uppercase"
        >
          Email*
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={320}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? `${emailId}-error` : undefined}
          className={inputStyles}
        />
        {state.fieldErrors?.email && (
          <p id={`${emailId}-error`} className="text-sm text-destructive">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={messageId}
          className="font-mono text-xs tracking-wide text-muted-foreground uppercase"
        >
          Message*
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={4}
          required
          maxLength={5000}
          aria-invalid={Boolean(state.fieldErrors?.message)}
          aria-describedby={state.fieldErrors?.message ? `${messageId}-error` : undefined}
          className={cn(inputStyles, 'resize-y')}
        />
        {state.fieldErrors?.message && (
          <p id={`${messageId}-error`} className="text-sm text-destructive">
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      {/*
        Honeypot: hidden from sighted and keyboard users via CSS + tabIndex,
        and out of the accessibility tree via aria-hidden, but still present
        for naive bots that fill in every input they find. Any value here
        makes submitContactForm silently no-op.
      */}
      <div aria-hidden="true" className="absolute top-auto left-[-9999px] size-0 overflow-hidden">
        <label htmlFor={companyId}>Company</label>
        <input id={companyId} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-4 flex flex-col items-start gap-3">
        <Button
          type="submit"
          variant="default"
          size="lg"
          startIcon="mdi:subdirectory-arrow-right"
          disabled={isPending}
        >
          {isPending ? 'Sending…' : 'Get in touch'}
        </Button>

        {state.status === 'success' && (
          <output className="text-sm text-muted-foreground">
            Thanks for reaching out — I'll get back to you soon.
          </output>
        )}
        {state.status === 'error' && state.message && !state.fieldErrors && (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        )}
      </div>
    </form>
  )
}
