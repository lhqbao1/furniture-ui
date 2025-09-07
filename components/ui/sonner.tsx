"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  // const { theme = "system" } = useTheme()
  const { theme = "light" } = useTheme()
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "white",
          "--normal-text": "#51BE8C",
          "--success-text": "#51BE8C",
          "--normal-border": "var(--border)",
          "--success-bg": '#DCF2E8',
          "--error-bg": '#f0cece',
          "--error-text": "#f22929",
          "--error-border": "#f0cece",
          "--success-border": 'rgba(81,190,140,0.1)',
          "--z-index": '100',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
