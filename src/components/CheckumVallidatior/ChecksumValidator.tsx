import config from '@payload-config'
import { getPayload } from 'payload'

import { CollectionSlug } from '@/types/collections'

import { ChecksumValidatorClient } from './ChecksumValidator.client'

export const ChecksumValidator = async () => {
  const searchChecksum = async (checksum: string) => {
    'use server'

    const payload = await getPayload({
      config,
    })

    const {
      docs: [doc],
    } = await payload.find({
      collection: CollectionSlug.ResumeDocuments,
      where: {
        or: [
          {
            checksum_en: {
              equals: checksum,
            },
          },
          {
            checksum_de: {
              equals: checksum,
            },
          },
        ],
      },
    })

    return doc
  }

  return <ChecksumValidatorClient searchChecksum={searchChecksum} />
}
