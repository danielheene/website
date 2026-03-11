'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { chunk } from 'lodash-es'

export const useArrayPagination = <T>(data: T[], size: number = 10): {
  content: T[],
  hasPrevPage: boolean,
  hasNextPage: boolean,
  setNextPage: () => void,
  setPrevPage: () => void
} => {
  const prevData = useRef(data)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (JSON.stringify(prevData.current) !== JSON.stringify(data)) {
      setOffset(0)
      prevData.current = data
    }
  }, [data])

  useEffect(() => {
    setOffset(0)
  }, [size])

  const {
    hasPrevPage,
    hasNextPage,
    content,
  } = useMemo(() => {
    const chunks: T[][] = chunk(data, size)
    return {
      hasPrevPage: offset > 0 && chunks.length > 1,
      hasNextPage: offset < chunks.length - 1 && chunks.length > 1,
      content: Array.isArray(chunks[offset]) ? chunks[offset] : [],
    }
  }, [offset, data, size])


  const setNextPage = () => setOffset(offset + 1)
  const setPrevPage = () => setOffset(offset - 1)

  return {
    setNextPage,
    setPrevPage,
    hasPrevPage,
    hasNextPage,
    content,
  }
}
