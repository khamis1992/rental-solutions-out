
import { supabase } from "@/integrations/supabase/client";
import { CustomerProfile, LoyaltyPoints, CustomerReward } from "@/types/database/customer.types";
import { PaymentView } from "@/types/database/payment.types";

export async function getCustomerPortalData(customerId: string) {
  try {
    // Get customer profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", customerId)
      .single();

    if (profileError) throw profileError;

    // Get loyalty points
    const { data: loyaltyPoints, error: loyaltyError } = await supabase
      .from("loyalty_points")
      .select("*")
      .eq("customer_id", customerId)
      .single();

    if (loyaltyError && loyaltyError.code !== 'PGRST116') {
      throw loyaltyError;
    }

    // Get payment history
    const { data: payments, error: paymentsError } = await supabase
      .from("payment_history_view")
      .select(`
        id,
        lease_id,
        amount,
        amount_paid,
        balance,
        status,
        payment_date,
        transaction_id,
        payment_method,
        security_deposit_id,
        created_at,
        updated_at,
        description,
        is_recurring,
        recurring_interval,
        next_payment_date,
        type,
        late_fine_amount,
        days_overdue,
        agreement_number,
        customer_name,
        customer_phone,
        customer_email,
        actual_payment_date,
        original_due_date
      `)
      .eq("customer_id", customerId)
      .order('payment_date', { ascending: false });

    if (paymentsError) throw paymentsError;

    // Get customer rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from("customer_rewards")
      .select(`
        *,
        rewards_catalog (
          id,
          name,
          description,
          points_cost,
          reward_type,
          tier_requirement
        )
      `)
      .eq("customer_id", customerId);

    if (rewardsError) throw rewardsError;

    return {
      profile: profile as CustomerProfile,
      loyaltyPoints: loyaltyPoints as LoyaltyPoints,
      payments: payments as PaymentView[],
      rewards: rewards as CustomerReward[]
    };
  } catch (error) {
    console.error("Error fetching customer portal data:", error);
    throw error;
  }
}

export async function redeemReward(customerId: string, rewardId: string) {
  try {
    // Get reward details and current loyalty points
    const [rewardResult, pointsResult] = await Promise.all([
      supabase.from("rewards_catalog").select("*").eq("id", rewardId).single(),
      supabase.from("loyalty_points").select("*").eq("customer_id", customerId).single()
    ]);

    if (rewardResult.error) throw rewardResult.error;
    if (pointsResult.error) throw pointsResult.error;

    const reward = rewardResult.data;
    const currentPoints = pointsResult.data;

    if (currentPoints.points < reward.points_cost) {
      throw new Error("Insufficient points");
    }

    // Create expiry date 3 months from now
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 3);

    // Start a transaction
    const { error: redeemError } = await supabase.rpc('redeem_customer_reward', {
      p_customer_id: customerId,
      p_reward_id: rewardId,
      p_points_cost: reward.points_cost,
      p_expiry_date: expiryDate.toISOString()
    });

    if (redeemError) throw redeemError;

    return true;
  } catch (error) {
    console.error("Error redeeming reward:", error);
    throw error;
  }
}

export async function updateCustomerProfile(customerId: string, profileData: Partial<CustomerProfile>) {
  try {
    const { error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", customerId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating customer profile:", error);
    throw error;
  }
}
