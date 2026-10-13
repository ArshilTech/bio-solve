
export default function SectionHeading({
  title,
  detail,
  description,
  action,
}) {
  const supportingText = detail ?? description;

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <h3 className="text-[15px] font-bold text-[#23433c]">
          {title}
        </h3>

        {supportingText && (
          <p className="mt-1 text-xs text-[#87978f]">
            {supportingText}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}
