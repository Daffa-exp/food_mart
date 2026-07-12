import Breadcrumb, { BreadcrumbItem } from "@/components/ui/Breadcrumb";

interface PageHeaderProps {
  breadcrumb: BreadcrumbItem[];
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ breadcrumb, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="border-b border-surface-border bg-surface-cream">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb items={breadcrumb} />
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-primary-500 sm:text-3xl">{title}</h1>
            {subtitle && <p className="mt-1.5 text-sm text-ink-700">{subtitle}</p>}
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}
