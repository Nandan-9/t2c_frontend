interface Props {
  tag: string;
  name: string;
}

export function MinisterBadge({ tag, name }: Props) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#C92A2A]/10 text-[#C92A2A]">
      {name}
      <span className="opacity-70">{tag}</span>
    </span>
  );
}
