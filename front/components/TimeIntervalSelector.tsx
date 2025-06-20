import React from "react";
import { Clock, Calendar } from "lucide-react";
import { format, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TimeInterval } from "../types/chart-data";

interface TimeIntervalSelectorProps {
  selectedInterval: TimeInterval;
  onIntervalChange: (interval: TimeInterval) => void;
  sampleDate?: Date;
}

export function TimeIntervalSelector({
  selectedInterval,
  onIntervalChange,
  sampleDate = new Date(),
}: TimeIntervalSelectorProps) {
  const getIntervalExample = (interval: TimeInterval, date: Date): string => {
    switch (interval) {
      case "minute":
        return format(date, "HH:mm", { locale: ptBR });
      case "day":
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      case "week":
        const weekStart = startOfWeek(date, { locale: ptBR });
        return `Semana de ${format(weekStart, "dd/MM", { locale: ptBR })}`;
      case "month":
        const monthStart = startOfMonth(date);
        return format(monthStart, "MMMM 'de' yyyy", { locale: ptBR });
      case "year":
        const yearStart = startOfYear(date);
        return format(yearStart, "yyyy", { locale: ptBR });
      default:
        return "";
    }
  };

  const timeIntervalOptions = [
    { value: "minute" as TimeInterval, label: "Por Minuto" },
    { value: "day" as TimeInterval, label: "Por Dia" },
    { value: "week" as TimeInterval, label: "Por Semana" },
    { value: "month" as TimeInterval, label: "Por Mês" },
    { value: "year" as TimeInterval, label: "Por Ano" },
  ];

  return (
    <div className="w-full space-y-3">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        <Clock className="inline h-4 w-4 mr-1" />
        Intervalo de Agrupamento
      </label>

      <select
        value={selectedInterval}
        onChange={(e) => onIntervalChange(e.target.value as TimeInterval)}
        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        {timeIntervalOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} - ex: {getIntervalExample(option.value, sampleDate)}
          </option>
        ))}
      </select>

      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-2 text-violet-600 dark:text-violet-400" />
          <span className="text-slate-600 dark:text-slate-400">
            Agrupamento atual:
          </span>
          <span className="ml-2 font-medium text-slate-900 dark:text-white">
            {getIntervalExample(selectedInterval, sampleDate)}
          </span>
        </div>
      </div>
    </div>
  );
}
