
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarEvent, CalendarEventFormData } from "@/hooks/useCalendarEvents";
import { format, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, X } from "lucide-react";
import { ko } from "date-fns/locale";
import { useLocation, useSearchParams } from "react-router-dom";

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEvent: CalendarEvent | null;
  createEvent: (data: CalendarEventFormData) => Promise<CalendarEvent | null>;
  updateEvent: (id: string, data: Partial<CalendarEventFormData>) => Promise<CalendarEvent | null>;
}

const eventTypes = [
  { value: "meeting", label: "회의" },
  { value: "training", label: "교육" },
  { value: "event", label: "행사" },
  { value: "volunteer", label: "봉사" },
  { value: "other", label: "기타" },
];

const timeOptions = Array.from({ length: 24 * 4 }).map((_, i) => {
  const hour = Math.floor(i / 4);
  const minute = (i % 4) * 15;
  const formattedHour = hour.toString().padStart(2, "0");
  const formattedMinute = minute.toString().padStart(2, "0");
  return {
    value: `${formattedHour}:${formattedMinute}`,
    label: `${formattedHour}:${formattedMinute}`
  };
});

const EventForm: React.FC<EventFormProps> = ({ 
  open, 
  onOpenChange, 
  selectedEvent, 
  createEvent, 
  updateEvent 
}) => {
  const form = useForm<CalendarEventFormData>({
    defaultValues: {
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      type: "meeting",
    },
  });
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  // 폼 초기화 - 깊은 복사와 null/undefined 처리 추가
  useEffect(() => {
    if (!open) return; // 모달이 열린 경우에만 폼 초기화
    
    if (selectedEvent) {
      try {
        // 이벤트 데이터의 깊은 복사본 생성 
        const formData = {
          title: selectedEvent.title || "",
          description: selectedEvent.description || "",
          start_time: selectedEvent.start_time || new Date().toISOString(),
          end_time: selectedEvent.end_time || new Date().toISOString(),
          location: selectedEvent.location || "",
          type: selectedEvent.type || "meeting",
        };
        
        form.reset(formData);
      } catch (error) {
        console.error("Error resetting form with event data:", error);
      }
    } else {
      // 새 일정 추가 시 현재 선택된 날짜가 있다면 적용
      let startDate = new Date();
      let dateFound = false;
      
      // 데이터 소스 우선순위: 
      // 1. location.state (Navigation API 사용) 
      // 2. URL 검색 파라미터
      // 3. 기본값 (현재 날짜)
      
      // location.state에서 날짜 확인
      const state = location.state as any;
      if (state?.selectedDate) {
        try {
          startDate = parseISO(state.selectedDate);
          dateFound = true;
          console.log("Using date from location state:", state.selectedDate);
        } catch (error) {
          console.error("유효하지 않은 날짜 형식 (state):", error);
        }
      }
      
      // URL 검색 파라미터에서 날짜 확인 (state에 날짜가 없는 경우에만)
      if (!dateFound) {
        const dateParam = searchParams.get('date');
        if (dateParam) {
          try {
            startDate = parseISO(dateParam);
            dateFound = true;
            console.log("Using date from URL params:", dateParam);
          } catch (error) {
            console.error("유효하지 않은 날짜 형식 (URL):", error);
          }
        }
      }
      
      // 시작 시간을 해당 날짜의 9시로 설정
      const startDateTime = new Date(startDate);
      startDateTime.setHours(9, 0, 0, 0);
      
      // 종료 시간을 해당 날짜의 10시로 설정
      const endDateTime = new Date(startDate);
      endDateTime.setHours(10, 0, 0, 0);
      
      console.log("Form reset with date:", startDateTime);
      
      form.reset({
        title: "",
        description: "",
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location: "",
        type: "meeting",
      });
    }
  }, [selectedEvent, form, open, searchParams, location.state]);

  const handleSubmit = (data: CalendarEventFormData) => {
    try {
      // 모든 필수 필드가 있는지 확인
      if (!data.title) {
        console.error("Title is required");
        return;
      }
      
      if (!data.start_time || !data.end_time) {
        console.error("Start and end times are required");
        return;
      }
      
      // 폼 데이터 전송
      if (selectedEvent?.id) {
        updateEvent(selectedEvent.id, data);
      } else {
        createEvent(data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const getSelectedDate = (dateString: string): Date | undefined => {
    return dateString ? parseISO(dateString) : undefined;
  };

  const getTimeFromDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      return format(date, 'HH:mm');
    } catch (error) {
      console.error("Error parsing date:", error);
      return "00:00";
    }
  };

  const combineDateTime = (date: Date, timeString: string): string => {
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      return newDate.toISOString();
    } catch (error) {
      console.error("Error combining date and time:", error);
      return new Date().toISOString();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b flex flex-row justify-between items-center">
          <DialogTitle className="text-lg font-bold">{selectedEvent ? '일정 수정' : '새 일정 추가'}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <p className="text-sm text-muted-foreground mb-4">
            {selectedEvent ? '일정을 수정하려면 아래 양식을 작성하세요.' : '새로운 일정을 추가하려면 아래 양식을 작성하세요.'}
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* 제목 */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">제목</FormLabel>
                    <FormControl>
                      <Input placeholder="일정 제목" {...field} className="h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 날짜 */}
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">날짜</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "h-12 pl-3 text-left font-normal w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(parseISO(field.value), "yyyy년 MM월 dd일", { locale: ko })
                            ) : (
                              <span>날짜 선택</span>
                            )}
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0 pointer-events-auto" 
                        align="start"
                        side="bottom"
                        sideOffset={4}
                      >
                        <div className="bg-background rounded-md shadow-md border pointer-events-auto">
                          <Calendar
                            mode="single"
                            selected={field.value ? parseISO(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const timeString = getTimeFromDate(field.value) || '09:00';
                                const newDateTime = combineDateTime(date, timeString);
                                field.onChange(newDateTime);
                                
                                // Also update end_time to be the same date if not set
                                const endTimeValue = form.getValues("end_time");
                                if (!endTimeValue) {
                                  const endTime = combineDateTime(date, '10:00');
                                  form.setValue("end_time", endTime);
                                } else {
                                  // Keep end time but update date
                                  const endTime = getTimeFromDate(endTimeValue);
                                  const newEndDateTime = combineDateTime(date, endTime);
                                  form.setValue("end_time", newEndDateTime);
                                }
                              }
                            }}
                            initialFocus
                            locale={ko}
                            className="border-0 select-none pointer-events-auto"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                {/* 시작 시간 */}
                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">시작 시간</FormLabel>
                      <Select 
                        value={getTimeFromDate(field.value)}
                        onValueChange={(time) => {
                          if (field.value) {
                            const date = parseISO(field.value);
                            field.onChange(combineDateTime(date, time));
                          } else {
                            const today = new Date();
                            field.onChange(combineDateTime(today, time));
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="-- --:--" />
                            <Clock className="h-4 w-4 opacity-50" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="h-[300px] pointer-events-auto">
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 종료 시간 */}
                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">종료 시간</FormLabel>
                      <Select 
                        value={getTimeFromDate(field.value)}
                        onValueChange={(time) => {
                          if (field.value) {
                            const date = parseISO(field.value);
                            field.onChange(combineDateTime(date, time));
                          } else {
                            const startTime = form.getValues("start_time");
                            const date = startTime ? parseISO(startTime) : new Date();
                            field.onChange(combineDateTime(date, time));
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="-- --:--" />
                            <Clock className="h-4 w-4 opacity-50" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="h-[300px] pointer-events-auto">
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 장소 */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">장소</FormLabel>
                    <FormControl>
                      <Input placeholder="일정 장소" {...field} value={field.value || ""} className="h-12" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 일정 유형 */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">일정 유형</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="일정 유형 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="pointer-events-auto">
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 설명 */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">설명</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="일정에 대한 상세 설명" 
                        {...field} 
                        value={field.value || ""} 
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 mt-4 bg-blue-500 hover:bg-blue-600">
                {selectedEvent ? '일정 수정' : '일정 추가'}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
