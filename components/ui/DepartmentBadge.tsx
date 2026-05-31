interface Props {
  name: string;
}

export function DepartmentBadge({ name }: Props) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
      {name}
    </span>
  );
}
