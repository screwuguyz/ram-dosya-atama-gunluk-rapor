"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, DayProps } from "react-day-picker"
import { tr } from "date-fns/locale"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Türkiye resmi tatilleri (sabit tarihler)
const TURKEY_HOLIDAYS: { [key: string]: string } = {
  "01-01": "Yılbaşı",
  "04-23": "Ulusal Egemenlik ve Çocuk Bayramı",
  "05-01": "Emek ve Dayanışma Günü",
  "05-19": "Atatürk'ü Anma, Gençlik ve Spor Bayramı",
  "07-15": "Demokrasi ve Milli Birlik Günü",
  "08-30": "Zafer Bayramı",
  "10-29": "Cumhuriyet Bayramı",
}

// Yarım gün tatiller
const HALF_DAY_HOLIDAYS: { [key: string]: string } = {
  "10-28": "Cumhuriyet Bayramı Arifesi",
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6 // Pazar veya Cumartesi
}

function isHoliday(date: Date): string | null {
  const monthDay = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  return TURKEY_HOLIDAYS[monthDay] || null
}

function isHalfDayHoliday(date: Date): string | null {
  const monthDay = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  return HALF_DAY_HOLIDAYS[monthDay] || null
}

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={tr}
      className={cn("p-4 select-none", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center h-10",
        caption_label: "text-base font-semibold text-slate-800",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "absolute left-2 top-3 z-10",
          "inline-flex items-center justify-center",
          "h-8 w-8 rounded-full",
          "bg-white border border-slate-200 shadow-sm",
          "text-slate-600 hover:text-slate-900",
          "hover:bg-slate-50 hover:border-slate-300 hover:shadow",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        ),
        button_next: cn(
          "absolute right-2 top-3 z-10",
          "inline-flex items-center justify-center",
          "h-8 w-8 rounded-full",
          "bg-white border border-slate-200 shadow-sm",
          "text-slate-600 hover:text-slate-900",
          "hover:bg-slate-50 hover:border-slate-300 hover:shadow",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex mb-2",
        weekday: cn(
          "w-10 h-8 flex items-center justify-center",
          "text-xs font-semibold uppercase tracking-wide",
          "text-slate-500"
        ),
        week: "flex w-full",
        day: cn(
          "relative w-10 h-10 p-0",
          "flex items-center justify-center",
          "transition-all duration-150"
        ),
        day_button: cn(
          "h-9 w-9 p-0 font-medium text-sm rounded-lg",
          "transition-all duration-150",
          "hover:bg-slate-100 hover:text-slate-900",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
          "aria-selected:opacity-100"
        ),
        range_end: "day-range-end",
        selected: cn(
          "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white",
          "shadow-lg shadow-indigo-500/30",
          "hover:from-indigo-600 hover:to-indigo-700",
          "rounded-lg"
        ),
        today: cn(
          "bg-indigo-50 text-indigo-700 font-bold",
          "ring-2 ring-indigo-500 ring-offset-1",
          "rounded-lg"
        ),
        outside: cn(
          "text-slate-300 opacity-50",
          "aria-selected:bg-slate-100 aria-selected:text-slate-400"
        ),
        disabled: "text-slate-300 opacity-50 cursor-not-allowed",
        range_middle: "aria-selected:bg-indigo-50 aria-selected:text-indigo-700",
        hidden: "invisible",
        ...classNames,
      }}
      modifiers={{
        weekend: (date) => isWeekend(date),
        holiday: (date) => isHoliday(date) !== null,
        halfday: (date) => isHalfDayHoliday(date) !== null,
      }}
      modifiersClassNames={{
        weekend: "text-rose-500 font-medium",
        holiday: "bg-rose-50 text-rose-600 font-semibold rounded-lg",
        halfday: "bg-amber-50 text-amber-600 font-medium rounded-lg",
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" strokeWidth={2.5} />
        },
        DayButton: ({ day, modifiers, ...buttonProps }) => {
          const holidayName = isHoliday(day.date)
          const halfDayName = isHalfDayHoliday(day.date)
          const weekend = isWeekend(day.date)

          return (
            <button
              {...buttonProps}
              title={holidayName || halfDayName || (weekend ? "Hafta sonu" : undefined)}
              className={cn(
                buttonProps.className,
                // Hafta sonu stilleri (seçili değilse)
                weekend && !modifiers.selected && "text-rose-500 hover:bg-rose-50",
                // Tatil stilleri (seçili değilse)
                holidayName && !modifiers.selected && "bg-rose-100 text-rose-700 hover:bg-rose-200 font-semibold",
                // Yarım gün tatil stilleri
                halfDayName && !modifiers.selected && "bg-amber-100 text-amber-700 hover:bg-amber-200"
              )}
            />
          )
        },
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
