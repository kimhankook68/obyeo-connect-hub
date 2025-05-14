
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-4 text-center text-xs text-muted-foreground border-t">
      <p>© {new Date().getFullYear()} 사회복지법인 오병이어복지재단 All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;
