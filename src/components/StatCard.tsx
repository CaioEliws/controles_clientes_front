import { Card } from "@/components/ui/card";

export const StatCard = ({ label, value }: { label: string, value: number | string }) => (
  <Card className="rounded-2xl p-4 flex flex-col items-start gap-1 shadow-sm">
    <p className="text-sm text-muted-foreground">{label}</p>
    <h2 className="text-2xl font-bold">{value}</h2>
  </Card>
);