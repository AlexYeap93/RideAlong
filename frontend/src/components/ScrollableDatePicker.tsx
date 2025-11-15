import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";

interface ScrollableDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  label?: string;
}

export function ScrollableDatePicker({ 
  selectedDate, 
  onDateChange, 
  minDate = new Date(),
  label = "Select Date:"
}: ScrollableDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(selectedDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(selectedDate.getDate());
  const [selectedYear, setSelectedYear] = useState(selectedDate.getFullYear());
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate || today;

  // Generate months
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Generate days (1-31, will be filtered based on month/year)
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Generate years (current year to 5 years ahead)
  const currentYear = today.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear + i);

  // Update selected date when month/day/year changes
  useEffect(() => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const day = Math.min(selectedDay, daysInMonth);
    
    const newDate = new Date(selectedYear, selectedMonth, day);
    newDate.setHours(0, 0, 0, 0);
    
    // Only update if date is valid and not in the past
    if (newDate >= min) {
      onDateChange(newDate);
      if (day !== selectedDay) {
        setSelectedDay(day);
      }
    } else {
      // If date is in the past, adjust to minimum date
      const adjustedDate = new Date(min);
      setSelectedMonth(adjustedDate.getMonth());
      setSelectedDay(adjustedDate.getDate());
      setSelectedYear(adjustedDate.getFullYear());
      onDateChange(adjustedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedDay, selectedYear]);

  // Sync with prop changes
  useEffect(() => {
    setSelectedMonth(selectedDate.getMonth());
    setSelectedDay(selectedDate.getDate());
    setSelectedYear(selectedDate.getFullYear());
  }, [selectedDate]);

  // Scroll to selected item
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (monthRef.current) {
          const monthElement = monthRef.current.querySelector(`[data-month="${selectedMonth}"]`);
          monthElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (dayRef.current) {
          const dayElement = dayRef.current.querySelector(`[data-day="${selectedDay}"]`);
          dayElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (yearRef.current) {
          const yearElement = yearRef.current.querySelector(`[data-year="${selectedYear}"]`);
          yearElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [isOpen, selectedMonth, selectedDay, selectedYear]);

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    const daysInNewMonth = getDaysInMonth(month, selectedYear);
    if (selectedDay > daysInNewMonth) {
      setSelectedDay(daysInNewMonth);
    }
  };

  const handleDayChange = (day: number) => {
    setSelectedDay(day);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    const daysInNewMonth = getDaysInMonth(selectedMonth, year);
    if (selectedDay > daysInNewMonth) {
      setSelectedDay(daysInNewMonth);
    }
  };

  const isDateDisabled = (month: number, day: number, year: number) => {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date < min;
  };

  return (
    <div className="flex items-center gap-3 flex-wrap w-full">
      {label && <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{label}</span>}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="default"
            className="w-full sm:w-[280px] justify-start text-left font-normal h-10 flex-shrink-0"
          >
            <CalendarIcon className="mr-2 h-5 w-5 flex-shrink-0" />
            <span className="truncate">{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[95vw] p-0" align="start">
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin' }}>
              {/* Month Scroll */}
              <div className="flex flex-col flex-shrink-0">
                <div className="text-[10px] sm:text-xs font-medium text-center mb-1 sm:mb-2 text-muted-foreground">Month</div>
                <div 
                  ref={monthRef}
                  className="w-24 sm:w-32 h-48 sm:h-64 overflow-y-auto border rounded-md scroll-smooth"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
                >
                  {months.map((month, index) => {
                    // Check if this month/year combination is valid
                    const testDate = new Date(selectedYear, index, 1);
                    testDate.setHours(0, 0, 0, 0);
                    const isDisabled = testDate < min;
                    return (
                      <button
                        key={index}
                        data-month={index}
                        onClick={() => !isDisabled && handleMonthChange(index)}
                        disabled={isDisabled}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm text-left hover:bg-accent transition-colors ${
                          selectedMonth === index 
                            ? 'bg-primary text-primary-foreground font-medium' 
                            : isDisabled 
                            ? 'text-muted-foreground opacity-50 cursor-not-allowed' 
                            : 'hover:text-foreground'
                        }`}
                      >
                        <span className="truncate block">{month}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Scroll */}
              <div className="flex flex-col flex-shrink-0">
                <div className="text-[10px] sm:text-xs font-medium text-center mb-1 sm:mb-2 text-muted-foreground">Day</div>
                <div 
                  ref={dayRef}
                  className="w-16 sm:w-20 h-48 sm:h-64 overflow-y-auto border rounded-md scroll-smooth"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
                >
                  {days.map((day) => {
                    const isDisabled = isDateDisabled(selectedMonth, day, selectedYear);
                    return (
                      <button
                        key={day}
                        data-day={day}
                        onClick={() => !isDisabled && handleDayChange(day)}
                        disabled={isDisabled}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm text-center hover:bg-accent transition-colors ${
                          selectedDay === day 
                            ? 'bg-primary text-primary-foreground font-medium' 
                            : isDisabled 
                            ? 'text-muted-foreground opacity-50 cursor-not-allowed' 
                            : 'hover:text-foreground'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Year Scroll */}
              <div className="flex flex-col flex-shrink-0">
                <div className="text-[10px] sm:text-xs font-medium text-center mb-1 sm:mb-2 text-muted-foreground">Year</div>
                <div 
                  ref={yearRef}
                  className="w-18 sm:w-24 h-48 sm:h-64 overflow-y-auto border rounded-md scroll-smooth"
                  style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
                >
                  {years.map((year) => {
                    const testDate = new Date(year, selectedMonth, 1);
                    testDate.setHours(0, 0, 0, 0);
                    const isDisabled = testDate < min;
                    return (
                      <button
                        key={year}
                        data-year={year}
                        onClick={() => !isDisabled && handleYearChange(year)}
                        disabled={isDisabled}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2.5 text-xs sm:text-sm text-center hover:bg-accent transition-colors ${
                          selectedYear === year 
                            ? 'bg-primary text-primary-foreground font-medium' 
                            : isDisabled 
                            ? 'text-muted-foreground opacity-50 cursor-not-allowed' 
                            : 'hover:text-foreground'
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="w-full"
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

