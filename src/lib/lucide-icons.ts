import {
  BarChart2,
  BookOpen,
  Factory,
  Folder,
  LayoutDashboard,
  Package,
  RotateCcw,
  Settings,
  Shield,
  ShoppingCart,
  Smartphone,
  TrendingUp,
  Truck,
  Users,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Shield,
  TrendingUp,
  Settings,
  Users,
  Truck,
  Factory,
  ShoppingCart,
  Package,
  RotateCcw,
  BookOpen,
  BarChart2,
  LayoutDashboard,
  Smartphone,
  Folder,
};

export function getLucideIcon(name: string): LucideIcon {
  return iconMap[name] ?? Folder;
}
