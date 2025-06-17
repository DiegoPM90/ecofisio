import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
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
    const selectedDateObj = new Date(year, month, day);
    const weekday = selectedDateObj.getDay();
    
    // Only allow Wednesdays (3), Fridays (5), and Saturdays (6)
    if (weekday !== 3 && weekday !== 5 && weekday !== 6) return;
    
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

  const getWeekday = (day: number | null) => {
    if (!day) return -1;
    const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return cellDate.getDay();
  };

  const isAvailableDay = (day: number | null) => {
    if (!day || isPastDate(day)) return false;
    const weekday = getWeekday(day);
    // 6 = Saturday only
    return weekday === 6;
  };

  const getAvailableSlots = (selectedDateStr: string) => {
    if (!selectedDateStr) return [];
    
    const selectedDay = parseInt(selectedDateStr.split('-')[2]);
    const weekday = getWeekday(selectedDay);
    
    switch (weekday) {
      case 6: // Saturday
        return ['10:00', '11:00', '12:00', '13:00'];
      default:
        return [];
    }
  };

  const availableSlots = getAvailableSlots(selectedDate);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Enhanced Date Selection Calendar */}
      <Card className="w-full shadow-2xl border-0 bg-gradient-to-br from-white via-green-50/20 to-blue-50/20 backdrop-blur-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Calendar className="text-white w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Seleccionar Fecha
              </h3>
            </div>
            <div className="flex items-center justify-center sm:justify-end space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={previousMonth} 
                className="p-3 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="font-bold text-slate-800 px-4 py-2 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl min-w-[160px] text-center text-lg border border-blue-100">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={nextMonth} 
                className="p-3 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="mb-4 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-xs sm:text-sm text-blue-800 font-medium">
              <p className="mb-1">📅 Horarios disponibles:</p>
              <ul className="text-xs space-y-0.5 sm:space-y-1">
                <li>• Miércoles: 19:30-20:30</li>
                <li>• Viernes: 18:30-19:30</li>
                <li>• Sábados: 10:00-13:00</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-xs font-medium text-slate-500 text-center py-1 sm:py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {getDaysInMonth(currentDate).map((day, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`
                  calendar-day aspect-square p-0 text-xs sm:text-sm h-8 w-8 sm:h-10 sm:w-10
                  ${!day ? 'invisible' : ''}
                  ${!isAvailableDay(day) ? 'text-slate-400 cursor-not-allowed bg-slate-50' : 'hover:bg-blue-50 text-blue-600 border border-blue-200'}
                  ${isToday(day) && isAvailableDay(day) ? 'bg-blue-100 font-bold' : ''}
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
        <Card className="w-full">
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Horarios Disponibles</h3>
            <div className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4">
              {formatDateDisplay(selectedDate)}
            </div>

            <div className="space-y-3 sm:space-y-4">
              {availableSlots.length > 0 ? (
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-slate-700 mb-2">Horarios disponibles</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? "default" : "outline"}
                        size="sm"
                        className={`
                          time-slot h-10 sm:h-11 text-sm sm:text-base
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
                  <p>Selecciona una fecha disponible en el calendario</p>
                  <p>Miércoles, viernes o sábado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
