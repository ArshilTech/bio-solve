
export default function PageTitle({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow && (
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#438878]">
            {eyebrow}
          </div>
        )}

        <h1 className="text-[25px] font-bold tracking-tight text-[#173a34] sm:text-[30px]">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#71847c]">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}
