interface Props {
  tag: string;
  name: string;
}

export function MinisterBadge({ tag, name }: Props) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#0169CC]/10 text-[#0169CC]">
      {name}
      <span className="opacity-70">{tag}</span>
    </span>
  );
}
