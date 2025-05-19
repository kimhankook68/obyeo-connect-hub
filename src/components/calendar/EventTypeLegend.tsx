import React from "react";
interface EventTypeLegendProps {
  compact?: boolean;
}
const EventTypeLegend: React.FC<EventTypeLegendProps> = ({
  compact = false
}) => {
  const eventTypes = [{
    type: "meeting",
    label: "회의",
    color: "bg-red-500"
  }, {
    type: "training",
    label: "교육",
    color: "bg-blue-500"
  }, {
    type: "event",
    label: "행사",
    color: "bg-amber-500"
  }, {
    type: "volunteer",
    label: "봉사",
    color: "bg-green-500"
  }, {
    type: "other",
    label: "기타",
    color: "bg-gray-500"
  }];
  return <div className="border-t pt-3 mt-3">
      <div className={compact ? "flex flex-wrap items-center justify-center gap-3" : "flex flex-wrap items-center gap-4"}>
        <span className="text-sm text-muted-foreground">일정 유형:</span>
        {eventTypes.map(eventType => <div key={eventType.type} className="flex items-center">
            <div className={`w-3 h-3 rounded-sm ${eventType.color} mr-1`}></div>
            <span className="text-xs">{eventType.label}</span>
          </div>)}
      </div>
      
      <div className="mt-2 text-center text-sm text-muted-foreground">
        <p>해당 날짜 클릭하시면 새 일정을 등록할 수 있습니다. / 세부 일정은 일정 제목을 클릭하시면 됩니다.</p>
      </div>
    </div>;
};
export default EventTypeLegend;