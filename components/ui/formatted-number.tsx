'use client'

import { useState, useEffect } from 'react'

interface FormattedNumberProps {
  value: number
  locale?: string
  options?: Intl.NumberFormatOptions
  prefix?: string
  suffix?: string
  className?: string
}

export function FormattedNumber({ 
  value, 
  locale = 'it-IT', 
  options,
  prefix = '',
  suffix = '',
  className = ''
}: FormattedNumberProps) {
  const [formattedValue, setFormattedValue] = useState("")

  useEffect(() => {
    setFormattedValue(value.toLocaleString(locale, options))
  }, [value, locale, options])

  return (
    <span className={className}>
      {prefix}{formattedValue || value}{suffix}
    </span>
  )
}

