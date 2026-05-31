interface Props {
  tag: string;
  name: string;
}

export function MinisterBadge({ tag, name }: Props) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#4F46E5]/10 text-[#4F46E5]">
      {name}
      <span className="opacity-70">{tag}</span>
    </span>
  );
}
