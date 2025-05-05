import { draftMode } from 'next/headers'

export async function GET(): Promise<Response> {
  await draftMode().then((draft) => draft.disable())
  return new Response('Draft mode is disabled')
}
