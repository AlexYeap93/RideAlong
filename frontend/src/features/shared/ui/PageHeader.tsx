import { ReactNode } from "react";

interface PageHeaderProps {title: string; icon?: ReactNode; children?: ReactNode;}

export function PageHeader({ title, icon, children }: PageHeaderProps) {
  return (
    <div className="p-4 border-b bg-white flex items-center justify-between">
      <div className="flex items-center gap-2 text-xl font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}
