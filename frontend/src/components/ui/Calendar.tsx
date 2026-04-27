'use client';
import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
export type CalendarProps = React.ComponentProps<typeof DayPicker>;
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={`p-3 ${className}`}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 transition-opacity',
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-warm-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-warm-100/50 dark:[&:has([aria-selected].day-outside)]:bg-white/5 [&:has([aria-selected])]:bg-warm-100 dark:[&:has([aria-selected])]:bg-white/10 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-warm-100 dark:hover:bg-white/10 rounded-md transition-colors',
        day_range_end: 'day-range-end',
        day_selected:
          'bg-brand-500 text-white hover:bg-brand-600 focus:bg-brand-500 focus:text-white',
        day_today: 'bg-warm-100 dark:bg-white/10 text-warm-900 dark:text-gray-100',
        day_outside:
          'day-outside text-warm-500 dark:text-gray-400 opacity-50 aria-selected:bg-warm-100/50 dark:aria-selected:bg-white/5 aria-selected:text-warm-500 dark:aria-selected:text-gray-400 aria-selected:opacity-30',
        day_disabled: 'text-warm-500 dark:text-gray-400 opacity-50',
        day_range_middle:
          'aria-selected:bg-warm-100 dark:aria-selected:bg-white/10 aria-selected:text-warm-900 dark:aria-selected:text-gray-100',
        day_hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';
export { Calendar };
