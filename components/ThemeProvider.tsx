
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { Attribute } from "next-themes"

// Correct props type
type ThemeProviderProps = {
    children: React.ReactNode
    attribute?: Attribute | Attribute[]
    defaultTheme?: string
    forcedTheme?: string
    enableSystem?: boolean
    disableTransitionOnChange?: boolean
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
