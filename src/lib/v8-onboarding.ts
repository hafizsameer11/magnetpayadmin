// Tracks the user's furthest-reached onboarding step so the splash screen
// can offer a Resume CTA instead of restarting the flow.
export const STEPS = [
  "/locale",
  "/welcome",
  "/role",
  "/signup",
  "/otp",
  "/passcode",
  "/profile",
  "/kyc1",
  "/kyc2",
  "/kyc-status",
  "/kyb",
  "/kyb-docs",
  "/bank",
  "/address",
  "/permissions",
] as const;

export type V8Step = (typeof STEPS)[number];

const KEY = "v8.onboardingStep";
const DONE_KEY = "v8.onboardingDone";

export function markStep(step: V8Step) {
  if (typeof window === "undefined") return;
  const current = window.localStorage.getItem(KEY) as V8Step | null;
  const cur = current ? STEPS.indexOf(current) : -1;
  const next = STEPS.indexOf(step);
  if (next > cur) window.localStorage.setItem(KEY, step);
}

export function getResumeStep(): V8Step | null {
  if (typeof window === "undefined") return null;
  if (window.localStorage.getItem(DONE_KEY)) return null;
  const v = window.localStorage.getItem(KEY) as V8Step | null;
  return v && STEPS.includes(v) ? v : null;
}

export function markOnboardingDone() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DONE_KEY, "1");
}

export function resetOnboarding() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.localStorage.removeItem(DONE_KEY);
}
