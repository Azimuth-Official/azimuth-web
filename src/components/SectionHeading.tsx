interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export default function SectionHeading({
  title,
  subtitle,
  centered = true,
}: SectionHeadingProps) {
  return (
    <div className={centered ? "text-center" : ""}>
      <div className="relative inline-block">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
          {title}
        </h2>
        <div className="mt-2 h-1 w-12 bg-amber-500 rounded-full mx-auto"></div>
      </div>
      {subtitle && (
        <p className={`text-slate-400 mt-4 max-w-2xl ${centered ? "mx-auto" : ""}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
