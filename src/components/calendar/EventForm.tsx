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
import { CalendarIcon, Clock } from "lucide-react";
import { ko } from "date-fns/locale";

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CalendarEventFormData) => void;
  event?: CalendarEvent | null;
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

const EventForm: React.FC<EventFormProps> = ({ open, onOpenChange, onSubmit, event }) => {
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

  console.log("EventForm rendering with event:", event);

  // 폼 초기화 - 깊은 복사와 null/undefined 처리 추가
  useEffect(() => {
    if (event) {
      console.log("Setting form values from event:", event);
      try {
        // 이벤트 데이터의 깊은 복사본 생성 
        const formData = {
          title: event.title || "",
          description: event.description || "",
          start_time: event.start_time || new Date().toISOString(),
          end_time: event.end_time || new Date().toISOString(),
          location: event.location || "",
          type: event.type || "meeting",
        };
        
        console.log("Form reset with data:", formData);
        form.reset(formData);
      } catch (error) {
        console.error("Error resetting form with event data:", error);
      }
    } else {
      console.log("Resetting form to empty values");
      form.reset({
        title: "",
        description: "",
        start_time: "",
        end_time: "",
        location: "",
        type: "meeting",
      });
    }
  }, [event, form, open]);

  const handleSubmit = (data: CalendarEventFormData) => {
    console.log("Form submit with data:", data);
    
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
      onSubmit(data);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{event ? "일정 수정" : "새 일정 추가"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목</FormLabel>
                  <FormControl>
                    <Input placeholder="일정 제목을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>설명</FormLabel>
                  <FormControl>
                    <Textarea placeholder="일정에 대한 설명을 입력하세요" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>시작 일시</FormLabel>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal flex-1",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(parseISO(field.value), "yyyy년 MM월 dd일", { locale: ko })
                              ) : (
                                <span>날짜 선택</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? parseISO(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const timeString = getTimeFromDate(field.value) || '00:00';
                                const newDateTime = combineDateTime(date, timeString);
                                field.onChange(newDateTime);
                              }
                            }}
                            initialFocus
                            locale={ko}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>

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
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="시간 선택" />
                            <Clock className="h-4 w-4 opacity-50" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="h-[300px]">
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>종료 일시</FormLabel>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal flex-1",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(parseISO(field.value), "yyyy년 MM월 dd일", { locale: ko })
                              ) : (
                                <span>날짜 선택</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? parseISO(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const timeString = getTimeFromDate(field.value) || '00:00';
                                const newDateTime = combineDateTime(date, timeString);
                                field.onChange(newDateTime);
                              }
                            }}
                            initialFocus
                            locale={ko}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>

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
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="시간 선택" />
                            <Clock className="h-4 w-4 opacity-50" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="h-[300px]">
                          {timeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>장소</FormLabel>
                  <FormControl>
                    <Input placeholder="장소를 입력하세요" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>일정 유형</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="일정 유형을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
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

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                취소
              </Button>
              <Button type="submit">
                {event ? "수정" : "추가"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EventForm;
