export function Header({ title, subtitle }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-center px-5 py-4 bg-white/70 backdrop-blur-md border-b border-black/5 w-full">
      {(title || subtitle) && (
        <div className="text-center">
          {subtitle && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500 mb-0.5">
              {subtitle}
            </p>
          )}
          {title && (
            <h2 className="text-lg font-extrabold text-[#1d1d1f] tracking-tight">{title}</h2>
          )}
        </div>
      )}
    </header>
  );
}
