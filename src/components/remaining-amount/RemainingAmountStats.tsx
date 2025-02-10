
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, Calculator, CircleDollarSign, PiggyBank } from "lucide-react";

export function RemainingAmountStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['remaining-amounts-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('remaining_amounts')
        .select('rent_amount, final_price, amount_paid, remaining_amount');

      if (error) throw error;

      const totalRentAmount = data.reduce((sum, item) => sum + (item.rent_amount || 0), 0);
      const totalFinalPrice = data.reduce((sum, item) => sum + (item.final_price || 0), 0);
      const totalAmountPaid = data.reduce((sum, item) => sum + (item.amount_paid || 0), 0);
      const totalRemainingAmount = data.reduce((sum, item) => sum + (item.remaining_amount || 0), 0);

      return {
        totalRentAmount,
        totalFinalPrice,
        totalAmountPaid,
        totalRemainingAmount,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-[100px]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Rent Amount",
      value: stats?.totalRentAmount || 0,
      icon: Wallet,
      className: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      iconClassName: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Total Final Price",
      value: stats?.totalFinalPrice || 0,
      icon: Calculator,
      className: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
      iconClassName: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Total Amount Paid",
      value: stats?.totalAmountPaid || 0,
      icon: CircleDollarSign,
      className: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      iconClassName: "text-green-600 dark:text-green-400"
    },
    {
      title: "Total Remaining Amount",
      value: stats?.totalRemainingAmount || 0,
      icon: PiggyBank,
      className: "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
      iconClassName: "text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card 
            key={index}
            className={`overflow-hidden transition-all duration-300 hover:shadow-lg group cursor-pointer
              bg-gradient-to-br ${card.className} border-0`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {card.title}
              </CardTitle>
              <div className={`rounded-full p-2 transition-all duration-300 group-hover:scale-110 ${card.iconClassName}`}>
                <Icon className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {formatCurrency(card.value)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
