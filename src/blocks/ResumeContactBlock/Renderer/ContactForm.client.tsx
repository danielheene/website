'use client'

import { useActionState, useEffect, useId, useRef } from 'react'

import { Button } from '@/components/Button'
import { type ContactFormState, submitContactForm } from '@/lib/actions/submitContactForm'
import { cn } from '@/lib/cn'

const initialState: ContactFormState = {
  status: 'idle',
}

const inputStyles = cn(
  'w-full rounded-none border border-border bg-transparent px-4 py-3',
  'text-base placeholder:text-muted-foreground',
  'outline-none transition-colors',
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
  }, [
    state.status,
  ])

  return (
    <form
      ref={formRef}
      action={formAction}
      noValidate
      className="col-span-12 md:col-start-3 md:col-span-8 my-8 flex flex-col gap-6 text-left"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={nameId} className="text-sm font-mono uppercase tracking-wide">
          Name
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
        <label htmlFor={emailId} className="text-sm font-mono uppercase tracking-wide">
          Email
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
        <label htmlFor={messageId} className="text-sm font-mono uppercase tracking-wide">
          Message
        </label>
        <textarea
          id={messageId}
          name="message"
          rows={6}
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
      <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden">
        <label htmlFor={companyId}>Company</label>
        <input id={companyId} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col items-start gap-3">
        <Button type="submit" variant="default" disabled={isPending}>
          {isPending ? 'Sending…' : 'Send message'}
        </Button>

        {state.status === 'success' && (
          <p role="status" className="text-sm text-muted-foreground">
            Thanks for reaching out — I'll get back to you soon.
          </p>
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
