import { baseApi } from "./base.api";

/**
 * Subscription Types
 */
export interface Subscription {
	id: string;
	userId: string;
	tier: "FREE" | "PRO";
	status: "ACTIVE" | "CANCELLED" | "PAST_DUE" | "INCOMPLETE" | "TRIALING";
	stripeCustomerId?: string | null;
	stripeSubscriptionId?: string | null;
	stripePriceId?: string | null;
	stripeCurrentPeriodEnd?: string | null;
	cancelAtPeriodEnd: boolean;
	stripeCancelAt?: string | null;
	emailNotifications: boolean;
	securityAlertEmails: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CheckoutSessionResponse {
	url: string;
}

export interface PortalSessionResponse {
	url: string;
}

export interface CancelSubscriptionResponse {
	cancelAtPeriodEnd: boolean;
	currentPeriodEnd: string | null;
	status: string;
}

/**
 * Subscription API slice
 */
export const subscriptionApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		/**
		 * Get current user's subscription
		 * Creates FREE subscription if none exists
		 */
		getSubscription: builder.query<Subscription, void>({
			query: () => "/subscriptions/me",
			providesTags: ["Subscription"],
		}),

		/**
		 * Create Stripe Checkout session for PRO upgrade
		 * Returns URL to redirect user to Stripe
		 */
		createCheckout: builder.mutation<CheckoutSessionResponse, void>({
			query: () => ({
				url: "/subscriptions/checkout",
				method: "POST",
			}),
		}),

		/**
		 * Create Stripe Billing Portal session
		 * Returns URL to redirect user to Stripe portal
		 */
		createPortal: builder.mutation<PortalSessionResponse, void>({
			query: () => ({
				url: "/subscriptions/portal",
				method: "POST",
			}),
		}),

		/**
		 * Cancel subscription at period end
		 * User keeps PRO access until the end of the billing period
		 */
		cancelSubscription: builder.mutation<CancelSubscriptionResponse, void>({
			query: () => ({
				url: "/subscriptions/cancel",
				method: "POST",
			}),
			async onQueryStarted(_, { dispatch, queryFulfilled }) {
				const { data } = await queryFulfilled;
				dispatch(
					subscriptionApi.util.updateQueryData(
						"getSubscription",
						undefined,
						(draft) => {
							draft.cancelAtPeriodEnd = data.cancelAtPeriodEnd;
							draft.stripeCurrentPeriodEnd = data.currentPeriodEnd;
						},
					),
				);
			},
		}),
	}),
});

export const {
	useGetSubscriptionQuery,
	useCreateCheckoutMutation,
	useCreatePortalMutation,
	useCancelSubscriptionMutation,
} = subscriptionApi;
