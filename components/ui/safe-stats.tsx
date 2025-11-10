"use client";

import { useState, useEffect } from "react";

interface SafeStatsProps {
  value: number | string;
  locale?: string;
  options?: Intl.NumberFormatOptions;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function SafeStats({
  value,
  locale = "it-IT",
  options,
  prefix = "",
  suffix = "",
  className = "",
}: SafeStatsProps) {
  const [formattedValue, setFormattedValue] = useState("");

  useEffect(() => {
    if (typeof value === "number") {
      setFormattedValue(value.toLocaleString(locale, options));
    } else {
      setFormattedValue(String(value));
    }
  }, [value, locale, options]);

  return (
    <span className={className}>
      {prefix}
      {formattedValue || value}
      {suffix}
    </span>
  );
}


