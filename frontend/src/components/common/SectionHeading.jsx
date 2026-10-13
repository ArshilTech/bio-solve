
export default function SectionHeading({ title, description, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-[#203b35]">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-[#788780]">{description}</p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}
