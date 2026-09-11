"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import TiltCard from "@/components/portal/tilt-card";
import {
  FileText, HandHeart, Receipt, FolderOpen,
  Image, Gift, MessageSquare, CreditCard, CalendarDays,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  FileText, HandHeart, Receipt, FolderOpen, Image, Gift, MessageSquare, CreditCard, CalendarDays,
};

interface QuickLink {
  label: string;
  href: string;
  iconName: string;
  color: string;
  count?: number | null;
}

export default function DashboardQuickLinks({ links }: { links: QuickLink[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {links.map((link) => {
        const Icon = iconMap[link.iconName];
        return (
          <Link key={link.href} href={link.href}>
            <TiltCard intensity={10}>
              <Card className="bg-northpeak-card border-northpeak-surface hover:border-northpeak-green/30 hover:shadow-[0_0_20px_rgba(0,229,160,0.1)] transition-all cursor-pointer h-full">
                <CardContent className="p-5 flex flex-col items-center text-center gap-2">
                  {Icon && (
                    <Icon
                      className={`h-7 w-7 ${link.color} transition-transform duration-200 group-hover:scale-110`}
                    />
                  )}
                  <p className="text-sm font-medium text-northpeak-text">
                    {link.label}
                  </p>
                  {link.count !== undefined && link.count !== null && link.count > 0 && (
                    <span className="text-xs text-northpeak-text-muted">
                      {link.count}
                    </span>
                  )}
                </CardContent>
              </Card>
            </TiltCard>
          </Link>
        );
      })}
    </div>
  );
}
