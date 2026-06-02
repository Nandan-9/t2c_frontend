const COLORS = [
  "bg-[#C92A2A] text-white",
  "bg-[#a82323] text-white",
  "bg-[#8f1d1d] text-white",
  "bg-[#7a1919] text-white",
  "bg-[#d94040] text-white",
  "bg-[#5c1010] text-white",
];

function colorFor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface Props {
  avatar_url?: string | null;
  username: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };

export function AvatarCircle({ avatar_url, username, size = "md" }: Props) {
  const cls = sizeMap[size];
  if (avatar_url) {
    return (
      <img
        src={avatar_url}
        alt={username}
        className={`${cls} rounded-full object-cover shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${cls} ${colorFor(username)} rounded-full flex items-center justify-center font-semibold shrink-0`}
    >
      {username[0]?.toUpperCase() ?? "?"}
    </div>
  );
}
