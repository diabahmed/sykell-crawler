import { TextShimmer } from "./motion-primitives/text-shimmer";

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  // Define colors based on title
  const getIconColors = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("pending")) {
      return "bg-orange-600/25 border border-orange-600/50 text-orange-500";
    } else if (lowerTitle.includes("completed")) {
      return "bg-emerald-600/25 border border-emerald-600/50 text-emerald-500";
    } else if (lowerTitle.includes("failed")) {
      return "bg-red-600/25 border border-red-600/50 text-red-500";
    } else if (lowerTitle.includes("total")) {
      return "bg-blue-600/25 border border-blue-600/50 text-blue-500";
    } else {
      // Default color
      return "bg-gray-600/25 border border-gray-600/50 text-gray-500";
    }
  };

  return (
    <div className="relative p-4 lg:p-5 group before:absolute before:inset-y-8 before:right-0 before:w-px before:bg-gradient-to-b before:from-input/30 before:via-input before:to-input/30 last:before:hidden">
      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div
          className={`max-[480px]:hidden size-10 shrink-0 rounded-full flex items-center justify-center ${getIconColors(
            title
          )}`}
        >
          {icon}
        </div>
        {/* Content */}
        <div>
          <div className="font-medium tracking-widest text-xs uppercase text-muted-foreground/60 before:absolute before:inset-0">
            {title === "Pending" ? (
              <TextShimmer duration={3} spread={2}>
                {title}
              </TextShimmer>
            ) : (
              <span>{title}</span>
            )}
          </div>
          <div className="text-2xl font-semibold mb-2"> {value}</div>
        </div>
      </div>
    </div>
  );
}

interface StatsGridProps {
  stats: StatsCardProps[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 min-[1200px]:grid-cols-4 border border-border rounded-xl bg-gradient-to-br from-sidebar/60 to-sidebar">
      {stats.map((stat) => (
        <StatsCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
