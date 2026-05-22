const COLORS = [
  "bg-[#0169CC] text-white",
  "bg-[#0158b0] text-white",
  "bg-[#0147a0] text-white",
  "bg-[#014890] text-white",
  "bg-[#013a80] text-white",
  "bg-[#012c70] text-white",
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
