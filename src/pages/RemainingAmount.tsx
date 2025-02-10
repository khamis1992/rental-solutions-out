
import { RemainingAmountImport } from "@/components/remaining-amount/RemainingAmountImport";
import { RemainingAmountList } from "@/components/remaining-amount/RemainingAmountList";
import { RemainingAmountStats } from "@/components/remaining-amount/RemainingAmountStats";

export default function RemainingAmount() {
  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Remaining Amounts</h1>
          <p className="text-sm text-muted-foreground">
            Track and manage remaining amounts for all agreements
          </p>
        </div>
        <RemainingAmountImport />
      </div>

      <div className="grid gap-6">
        <RemainingAmountStats />
        <RemainingAmountList />
      </div>
    </div>
  );
}
