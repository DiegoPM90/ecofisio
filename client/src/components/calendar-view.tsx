import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CalendarViewProps {
  onDateSelect?: (date: string) => void;
  onTimeSelect?: (time: string) => void;
}

export default function CalendarView({ onDateSelect, onTimeSelect }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("medicina-general");

  // Remove API call since we're using fixed Saturday slots

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handleDateSelect = (day: number | null) => {
    if (!day) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const selectedDate = new Date(year, month, day);
    
    // Only allow Saturdays (day 6)
    if (selectedDate.getDay() !== 6) return;
    
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    setSelectedDate(dateString);
    setSelectedTime("");
    onDateSelect?.(dateString);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onTimeSelect?.(time);
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const dayName = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} de ${month} ${year}`;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      currentDate.getFullYear() === today.getFullYear() &&
      currentDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isPastDate = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return cellDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const isSaturday = (day: number | null) => {
    if (!day) return false;
    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return cellDate.getDay() === 6;
  };

  const isAvailableDay = (day: number | null) => {
    return isSaturday(day) && !isPastDate(day);
  };

  // Saturday slots from 10:00 to 14:00 (cada hora)
  const saturdaySlots = selectedDate && isSaturday(parseInt(selectedDate.split('-')[2])) 
    ? ['10:00', '11:00', '12:00', '13:00', '14:00']
    : [];

  return (
    <div className="space-y-6">
      {/* Date Selection Calendar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Seleccionar Fecha</h3>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium text-slate-900 px-2 min-w-[140px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button variant="ghost" size="sm" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              📅 Solo disponible los sábados de 10:00 a 14:00 hrs
            </p>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-xs font-medium text-slate-500 text-center py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentDate).map((day, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`
                  calendar-day aspect-square p-0 text-sm h-10 w-10
                  ${!day ? 'invisible' : ''}
                  ${!isAvailableDay(day) ? 'text-slate-400 cursor-not-allowed bg-slate-50' : 'hover:bg-blue-50 text-blue-600 border border-blue-200'}
                  ${isToday(day) && isSaturday(day) ? 'bg-blue-100 font-bold' : ''}
                  ${selectedDate === `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                `}
                onClick={() => handleDateSelect(day)}
                disabled={!day || !isAvailableDay(day)}
              >
                {day}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Selection */}
      {selectedDate && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Horarios Disponibles</h3>
            <div className="text-sm text-slate-600 mb-4">
              {formatDateDisplay(selectedDate)}
            </div>

            <div className="space-y-4">
              {saturdaySlots.length > 0 ? (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Horarios disponibles (10:00 - 14:00)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {saturdaySlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? "default" : "outline"}
                        size="sm"
                        className={`
                          time-slot
                          ${selectedTime === slot ? 'bg-blue-600 text-white' : 'hover:border-blue-600 hover:bg-blue-50'}
                        `}
                        onClick={() => handleTimeSelect(slot)}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-500">
                  <p>Solo disponible los sábados de 10:00 a 14:00</p>
                  <p>Selecciona un sábado en el calendario</p>
                </div>
              )}


            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
