"use client";

import * as React from "react";
import { format, setHours, setMinutes } from "date-fns";
import { Calendar as CalendarIcon, Clock, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ptBR, enUS } from "date-fns/locale";

import { Calendar } from "./Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";

interface DateTimePickerProps {
  date: Date | null | undefined;
  setDate: (date: Date | null) => void;
  hasTime: boolean;
  setHasTime: (hasTime: boolean) => void;
}

export function DateTimePicker({ date, setDate, hasTime, setHasTime }: DateTimePickerProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "pt" ? ptBR : enUS;

  const handleDateSelect = (newDate: Date | undefined) => {
    if (!newDate) {
      setDate(null);
      setHasTime(false);
      return;
    }

    if (date) {
      // Preserve existing time if we already have a date
      const updatedDate = setHours(setMinutes(newDate, date.getMinutes()), date.getHours());
      setDate(updatedDate);
    } else {
      // Default to 12:00 if no time was set yet? 
      // Actually if hasTime is false, the time doesn't matter much but it's good to have a default.
      setDate(newDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!value) {
      setHasTime(false);
      return;
    }

    const [hours, minutes] = value.split(":").map(Number);
    const baseDate = date || new Date();
    setDate(setHours(setMinutes(baseDate, minutes), hours));
    setHasTime(true);
  };

  const clearTime = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHasTime(false);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDate(null);
    setHasTime(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`flex h-10 w-full items-center justify-between rounded-md border border-warm-200 dark:border-white/10 bg-white dark:bg-[#141414] px-3 py-2 text-sm text-warm-900 dark:text-gray-100 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-warm-50 dark:hover:bg-white/5 ${!date && "text-warm-500 dark:text-gray-400"}`}
        >
          <div className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 opacity-70" />
            {date ? (
              format(date, hasTime ? "PPP p" : "PPP", { locale })
            ) : (
              <span>{t("common.pick_date")}</span>
            )}
          </div>
          {date && (
             <X className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer" onClick={clearAll} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date || undefined}
          onSelect={handleDateSelect}
          initialFocus
          locale={locale}
        />
        <div className="border-t border-warm-100 dark:border-white/10 p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-warm-500" />
            <span className="text-xs font-medium">{t("common.set_time")}</span>
          </div>
          <div className="flex items-center gap-2">
             <input
              type="time"
              className="h-8 w-[100px] rounded-md border border-warm-200 dark:border-white/10 bg-transparent px-2 py-1 text-xs outline-none focus:border-brand-500"
              value={date && hasTime ? format(date, "HH:mm") : ""}
              onChange={handleTimeChange}
            />
            {hasTime && (
              <button
                type="button"
                onClick={clearTime}
                className="p-1 hover:bg-warm-100 dark:hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="h-3 w-3 text-warm-500" />
              </button>
            )}
          </div>
        </div>
        <div className="p-2 border-t border-warm-100 dark:border-white/10 flex justify-end">
           <button
             type="button"
             onClick={clearAll}
             className="text-[10px] uppercase tracking-wider font-bold text-warm-500 hover:text-red-500 transition-colors px-2 py-1"
           >
             {t("common.clear")}
           </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
