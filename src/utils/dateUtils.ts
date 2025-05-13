
import { format, parseISO } from "date-fns";

// Format event date to display format
export const formatEventDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    return format(date, "yyyy-MM-dd HH:mm");
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateString;
  }
};
