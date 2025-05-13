
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
};

const DashboardCard = ({ title, children, className, action }: DashboardCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-medium">{title}</h3>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

export default DashboardCard;
