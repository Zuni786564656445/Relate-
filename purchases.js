import { Platform } from "react-native";
import { supabase } from "./supabaseClient";

// Paste your real RevenueCat public SDK keys here once you've created a
// RevenueCat account and linked your App Store Connect / Play Console
// in-app purchase products. Leave blank to keep the app in test mode
// (paywall works, "purchases" are simulated and just flip a flag in your
// own database — no real money moves, good for development).
const REVENUECAT_IOS_KEY = "";
const REVENUECAT_ANDROID_KEY = "";

// These identifiers must exactly match the product IDs you create in
// App Store Connect / Google Play Console, and the offering/entitlement
// you set up in RevenueCat's dashboard.
export const PLANS = [
  { id: "relate_weekly", label: "Weekly", price: "$9.99", period: "/week", productId: "relate_weekly" },
  { id: "relate_monthly", label: "Monthly", price: "$28.99", period: "/month", productId: "relate_monthly", badge: "Most popular" },
  { id: "relate_lifetime", label: "Lifetime", price: "$99.99", period: " one-time", productId: "relate_lifetime", badge: "Best value" },
];

const ENTITLEMENT_ID = "premium";

let Purchases = null;
let configured = false;

function isTestMode() {
  // react-native-purchases is a native module — it doesn't run in Expo Go,
  // only in a custom dev client or a real build. If it's missing, or no
  // API key has been set above, we fall back to test mode automatically.
  const key = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
  return !Purchases || !key;
}

export async function initPurchases(userId) {
  try {
    // eslint-disable-next-line global-require
    Purchases = require("react-native-purchases").default;
  } catch (e) {
    Purchases = null; // not available in this runtime (e.g. Expo Go) — test mode
  }
  if (isTestMode()) return;
  const apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
  Purchases.configure({ apiKey, appUserID: userId });
  configured = true;
}

export async function getOfferings() {
  if (isTestMode()) return null; // caller falls back to the static PLANS list above
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchasePlan(plan, userId) {
  if (isTestMode()) {
    // TEST MODE: no real payment. Marks the account premium directly so you
    // can build and demo the rest of the app before your store products
    // and RevenueCat are fully set up. Replace by wiring real keys above.
    const { error } = await supabase
      .from("profiles")
      .update({
        is_premium: true,
        plan: plan.id,
        plan_expires_at: plan.id === "relate_lifetime" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { testMode: true };
  }

  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages.find((p) => p.product.identifier === plan.productId);
  if (!pkg) throw new Error(`Couldn't find the "${plan.productId}" product — check it's created in App Store Connect / Play Console and attached to this RevenueCat offering.`);
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  const active = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  if (active) {
    await supabase.from("profiles").update({ is_premium: true, plan: plan.id }).eq("id", userId);
  }
  return { testMode: false, active };
}

export async function restorePurchases(userId) {
  if (isTestMode()) {
    return { restored: false, testMode: true };
  }
  const customerInfo = await Purchases.restorePurchases();
  const active = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
  if (active) {
    await supabase.from("profiles").update({ is_premium: true }).eq("id", userId);
  }
  return { restored: active, testMode: false };
}
