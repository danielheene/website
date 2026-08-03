import config from '@payload-config'
import { getPayload } from 'payload'

const getPreferencesURL = async (preferencesKey: string) => {
  const payload = await getPayload({
    config,
  })
  return `${payload.getAPIURL()}/payload-preferences/${preferencesKey}`
}

export const getPreferences = async <K extends string | null>(
  preferencesKey: string,
): Promise<K> => {
  'use server'

  const url = await getPreferencesURL(preferencesKey)

  let data: K = null
  try {
    data = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then(({ value }) => (value || null) as K)
  } catch (error) {
    console.error('Error fetching preferences:', error)
  }

  return data
}

export const setPreferences = async <K extends string | null>(
  preferencesKey: string,
  preferencesValue: K,
): Promise<K> => {
  'use server'

  const url = await getPreferencesURL(preferencesKey)

  let data: K = null
  try {
    data = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: preferencesValue,
      }),
    })
      .then((response) => response.json())
      .then(({ doc: { value } = {} }) => (value || null) as K)
  } catch (error) {
    console.error('Error setting preferences:', error)
  }

  return data
}
