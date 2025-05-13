
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  type: string;
  user_id?: string;
  created_at: string;
}

export type CalendarEventFormData = Omit<CalendarEvent, "id" | "created_at" | "user_id">;

// Fetch all calendar events
export const fetchCalendarEvents = async () => {
  try {
    console.log("Fetching events from database");
    
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("start_time", { ascending: true });

    if (error) {
      throw error;
    }

    console.log("Fetched events:", data);
    return data || [];
  } catch (error: any) {
    console.error("Error fetching events:", error.message);
    throw error;
  }
};

// Create a new event
export const createCalendarEvent = async (eventData: CalendarEventFormData) => {
  try {
    console.log("Creating event with data:", eventData);
    
    const newEvent = {
      title: eventData.title,
      description: eventData.description || null,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      location: eventData.location || null,
      type: eventData.type
    };
    
    const { data, error } = await supabase
      .from("calendar_events")
      .insert(newEvent)
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      throw error;
    }

    console.log("Event created successfully:", data);
    return data;
  } catch (error: any) {
    console.error("Error creating event:", error.message);
    throw error;
  }
};

// Update an existing event
export const updateCalendarEvent = async (id: string, eventData: Partial<CalendarEventFormData>) => {
  try {
    console.log("Updating event with ID:", id, "and data:", eventData);
    
    // 업데이트할 데이터 준비 - null 값 처리 추가
    const updateData = {
      title: eventData.title,
      description: eventData.description === "" ? null : eventData.description,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      location: eventData.location === "" ? null : eventData.location,
      type: eventData.type
    };
    
    // 모든 필드가 유효한지 확인
    if (!updateData.title || !updateData.start_time || !updateData.end_time || !updateData.type) {
      console.error("Invalid update data:", updateData);
      throw new Error("필수 필드가 누락되었습니다");
    }
    
    // 업데이트 요청 전송
    const { data, error } = await supabase
      .from("calendar_events")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating event:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("업데이트된 데이터를 찾을 수 없습니다");
    }
    
    const updatedEvent = data[0];
    console.log("Event updated successfully:", updatedEvent);
    
    return updatedEvent;
  } catch (error: any) {
    console.error("Error updating event:", error.message);
    throw error;
  }
};

// Delete an event
export const deleteCalendarEvent = async (id: string) => {
  try {
    console.log("Deleting event with ID:", id);
    
    // ID 유효성 검사
    if (!id) {
      throw new Error("유효하지 않은 이벤트 ID");
    }
    
    // 삭제 요청 전송
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
    
    console.log("Event deleted successfully with ID:", id);
    return true;
  } catch (error: any) {
    console.error("Error deleting event:", error.message);
    throw error;
  }
};
