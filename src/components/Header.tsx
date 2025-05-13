
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className={cn("relative", isSearchOpen ? "w-96" : "w-64")}>
            <input
              type="text"
              placeholder="검색..."
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setIsSearchOpen(false)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              ⌘K
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
              <span className="text-base">🔔</span>
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 gap-2 pl-1 pr-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">GH</AvatarFallback>
                </Avatar>
                <span className="text-sm font-normal">길현호</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>내 계정</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>프로필</DropdownMenuItem>
              <DropdownMenuItem>설정</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>로그아웃</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
