const STATUS_CONFIG = {
  graduated: {
    label: "Graduated",
    classes: "bg-accent/20 text-accent border-accent/30",
  },
  "bonding-curve": {
    label: "Bonding Curve",
    classes: "bg-primary/20 text-primary border-primary/30",
  },
  migrating: {
    label: "Migrating",
    classes: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  "pre-launch": {
    label: "Pre-Launch",
    classes: "bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30",
  },
} as const;

export function StatusBadge({
  status,
}: {
  status: "graduated" | "bonding-curve" | "migrating" | "pre-launch";
}) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
