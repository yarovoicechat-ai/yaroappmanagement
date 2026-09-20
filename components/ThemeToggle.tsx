"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { Check, Palette, RotateCcw, Sparkles, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/Button"

type Font = "modern" | "rounded" | "classic" | "mono"
type Density = "comfortable" | "compact"
type Depth = "soft" | "crisp" | "none"
type Canvas = "white" | "mist" | "warm"
type Settings = { accent: string; font: Font; radius: number; density: Density; depth: Depth; canvas: Canvas }

const STORAGE_KEY = "yaro_management_theme_v2"
const DEFAULTS: Settings = { accent: "#2563eb", font: "modern", radius: 14, density: "comfortable", depth: "soft", canvas: "white" }
const PALETTES = [["Cobalt", "#2563eb"], ["Mint", "#059669"], ["Indigo", "#4f46e5"], ["Amber", "#d97706"]] as const
const FONTS: { id: Font; label: string; note: string }[] = [
    { id: "modern", label: "Modern", note: "Clean & focused" },
    { id: "rounded", label: "Rounded", note: "Friendly & soft" },
    { id: "classic", label: "Classic", note: "Editorial feel" },
    { id: "mono", label: "Mono", note: "Technical & crisp" },
]
const CANVASES: { id: Canvas; label: string; color: string }[] = [
    { id: "white", label: "Pure", color: "#fff" },
    { id: "mist", label: "Mist", color: "#f6f8fc" },
    { id: "warm", label: "Warm", color: "#fffbf5" },
]

function hexToHsl(hex: string) {
    const n = hex.replace("#", "")
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2
    if (max !== min) {
        const d = max - min
        s = l > .5 ? d / (2 - max - min) : d / (max + min)
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
        else if (max === g) h = (b - r) / d + 2
        else h = (r - g) / d + 4
        h /= 6
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

function apply(settings: Settings) {
    const root = document.documentElement
    const primary = hexToHsl(settings.accent)
    root.style.setProperty("--primary", primary)
    root.style.setProperty("--ring", primary)
    root.style.setProperty("--radius", `${settings.radius}px`)
    root.dataset.panelTheme = "management"
    root.dataset.font = settings.font
    root.dataset.density = settings.density
    root.dataset.shadow = settings.depth
    root.dataset.canvas = settings.canvas
}

export function ThemeToggle() {
    const { setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [open, setOpen] = React.useState(false)
    const [settings, setSettings] = React.useState<Settings>(DEFAULTS)
    const update = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((old) => ({ ...old, [key]: value }))

    React.useEffect(() => {
        setTheme("light")
        let value = DEFAULTS
        try { value = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") } }
        catch { localStorage.removeItem(STORAGE_KEY) }
        setSettings(value); apply(value); setMounted(true)
    }, [setTheme])

    React.useEffect(() => {
        if (!mounted) return
        apply(settings); localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    }, [mounted, settings])

    React.useEffect(() => {
        if (!open) return
        const escape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false)
        document.addEventListener("keydown", escape)
        return () => document.removeEventListener("keydown", escape)
    }, [open])

    const choice = (active: boolean) => `rounded-xl border p-3 text-left transition ${active ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-white hover:bg-secondary"}`

    return <>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)} className="theme-trigger h-9 gap-2 px-3" aria-haspopup="dialog" aria-expanded={open} title="Customize panel design">
            <Palette className="h-4 w-4" /><span className="hidden xl:inline">Design</span><span className="sr-only">Open theme studio</span>
        </Button>
        {mounted && open && createPortal(
            <ThemeStudio settings={settings} update={update} close={() => setOpen(false)} reset={() => setSettings(DEFAULTS)} choice={choice} />,
            document.body
        )}
    </>
}

type StudioProps = {
    settings: Settings
    update: <K extends keyof Settings>(key: K, value: Settings[K]) => void
    close: () => void
    reset: () => void
    choice: (active: boolean) => string
}

function ThemeStudio({ settings, update, close, reset, choice }: StudioProps) {
    return <div className="fixed inset-0 z-[100] flex justify-end">
        <button type="button" className="absolute inset-0 bg-slate-950/25 backdrop-blur-[2px]" onClick={close} aria-label="Close theme studio" />
        <aside role="dialog" aria-modal="true" aria-labelledby="theme-studio-title" className="theme-studio relative z-10 flex h-full w-full max-w-[390px] flex-col overflow-hidden border-l border-border bg-white shadow-2xl">
            <header className="theme-studio-hero relative overflow-hidden border-b border-border px-6 py-6">
                <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><Sparkles className="h-5 w-5" /></span>
                        <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-primary">Management appearance</p><h2 id="theme-studio-title" className="text-xl font-bold text-foreground">Theme Studio</h2></div>
                    </div>
                    <button type="button" onClick={close} className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground hover:bg-secondary" aria-label="Close"><X className="h-4 w-4" /></button>
                </div>
                <p className="relative mt-4 text-sm leading-6 text-muted-foreground">Customise the complete workspace. Changes preview instantly and save automatically.</p>
            </header>
            <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
                <section>
                    <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Brand colour</h3><label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-primary">Custom<input type="color" value={settings.accent} onChange={(e) => update("accent", e.target.value)} className="h-7 w-7 cursor-pointer rounded-full border-0 bg-transparent p-0" aria-label="Custom brand colour" /></label></div>
                    <div className="grid grid-cols-4 gap-2">{PALETTES.map(([name, color]) => <button key={name} type="button" onClick={() => update("accent", color)} className={choice(settings.accent.toLowerCase() === color) + " text-center text-[11px] font-semibold"}><span className="mx-auto mb-2 flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: color }}>{settings.accent.toLowerCase() === color && <Check className="h-3.5 w-3.5 text-white" />}</span>{name}</button>)}</div>
                </section>
                <section>
                    <h3 className="mb-3 text-sm font-bold">Typography</h3>
                    <div className="grid grid-cols-2 gap-2">{FONTS.map((font) => <button key={font.id} type="button" onClick={() => update("font", font.id)} className={choice(settings.font === font.id)}><span className={`theme-font-${font.id} block text-sm font-bold`}>{font.label}</span><span className="text-[10px] text-muted-foreground">{font.note}</span></button>)}</div>
                </section>
                <section>
                    <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Corner style</h3><span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-muted-foreground">{settings.radius}px</span></div>
                    <input type="range" min="2" max="24" step="2" value={settings.radius} onChange={(e) => update("radius", Number(e.target.value))} className="w-full accent-primary" aria-label="Corner roundness" />
                    <div className="flex justify-between text-[10px] text-muted-foreground"><span>Sharp</span><span>Rounded</span></div>
                </section>
                <section>
                    <h3 className="mb-3 text-sm font-bold">White canvas</h3>
                    <div className="grid grid-cols-3 gap-2">{CANVASES.map((canvas) => <button key={canvas.id} type="button" onClick={() => update("canvas", canvas.id)} className={choice(settings.canvas === canvas.id) + " text-center text-xs font-semibold"}><span className="mb-2 block h-8 rounded-lg border border-slate-200" style={{ backgroundColor: canvas.color }} />{canvas.label}</button>)}</div>
                </section>
                <section className="grid grid-cols-2 gap-4">
                    <div><h3 className="mb-2 text-sm font-bold">Spacing</h3><div className="flex rounded-xl bg-secondary p-1">{(["comfortable", "compact"] as Density[]).map((item) => <button key={item} type="button" onClick={() => update("density", item)} className={`w-1/2 rounded-lg py-2 text-[10px] font-bold ${settings.density === item ? "bg-white shadow-sm" : "text-muted-foreground"}`}>{item === "comfortable" ? "Comfy" : "Compact"}</button>)}</div></div>
                    <div><h3 className="mb-2 text-sm font-bold">Depth</h3><select value={settings.depth} onChange={(e) => update("depth", e.target.value as Depth)} className="h-10 w-full rounded-xl border border-border bg-white px-3 text-xs font-semibold"><option value="soft">Soft shadow</option><option value="crisp">Crisp border</option><option value="none">Flat</option></select></div>
                </section>
            </div>
            <footer className="flex items-center justify-between border-t border-border bg-slate-50/80 px-6 py-4">
                <p className="text-[11px] text-muted-foreground">Saved automatically</p>
                <Button type="button" variant="outline" size="sm" onClick={reset} className="gap-2"><RotateCcw className="h-3.5 w-3.5" />Reset</Button>
            </footer>
        </aside>
    </div>
}
