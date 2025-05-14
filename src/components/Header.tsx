
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface HeaderProps {
  title: string;
  rightContent?: ReactNode;
}

const Header = ({ title, rightContent }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">메뉴 열기</span>
          </Button>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        {rightContent && (
          <div>
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
