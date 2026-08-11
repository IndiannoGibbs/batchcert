export const ONBOARDING_COMPLETE_KEY = 'batchcert_onboarding_complete';

export const isOnboardingComplete = () =>
  localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';

export const markOnboardingComplete = () => {
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
};

export const resetOnboarding = () => {
  localStorage.removeItem(ONBOARDING_COMPLETE_KEY);
};
