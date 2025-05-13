
import React from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarEvent, CalendarEventFormData } from "@/hooks/useCalendarEvents";

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

const EventForm: React.FC<EventFormProps> = ({ open, onOpenChange, onSubmit, event }) => {
  const form = useForm<CalendarEventFormData>({
    defaultValues: event ? {
      title: event.title,
      description: event.description || "",
      start_time: event.start_time ? new Date(event.start_time).toISOString().substring(0, 16) : "",
      end_time: event.end_time ? new Date(event.end_time).toISOString().substring(0, 16) : "",
      location: event.location || "",
      type: event.type,
    } : {
      title: "",
      description: "",
      start_time: "",
      end_time: "",
      location: "",
      type: "meeting",
    },
  });

  const handleSubmit = (data: CalendarEventFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
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
                    <Textarea placeholder="일정에 대한 설명을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>시작 시간</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>종료 시간</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
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
                    <Input placeholder="장소를 입력하세요" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
