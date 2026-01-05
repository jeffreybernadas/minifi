import {
	Anchor,
	Box,
	Container,
	Divider,
	List,
	Stack,
	Table,
	Text,
	Title,
} from "@mantine/core";
import { Link } from "react-router-dom";

const LAST_UPDATED = "January 5, 2026";
const CONTACT_EMAIL = "jeffrey.bernadas0@gmail.com";

export default function PrivacyPage() {
	return (
		<Container size="md" py="xl">
			<Stack gap="xl">
				{/* Header */}
				<Box>
					<Title order={1}>Privacy Policy</Title>
					<Text c="dimmed" mt="xs">
						Last updated: {LAST_UPDATED}
					</Text>
				</Box>

				<Divider />

				{/* Introduction */}
				<Stack gap="md">
					<Text>
						Minifi is a personal portfolio project created and maintained by a
						solo developer. This Privacy Policy explains how information is
						collected, used, and safeguarded when you use this URL shortening
						service.
					</Text>
					<Text>
						By using Minifi, you agree to the collection and use of information
						in accordance with this policy.
					</Text>
				</Stack>

				{/* Information We Collect */}
				<Stack gap="md">
					<Title order={2}>1. Information We Collect</Title>

					<Title order={3} size="h4">
						1.1 Account Information
					</Title>
					<Text>When you create an account, the following is collected:</Text>
					<List>
						<List.Item>Email address</List.Item>
						<List.Item>Name (optional)</List.Item>
						<List.Item>Profile picture (optional)</List.Item>
						<List.Item>Phone number (optional)</List.Item>
					</List>

					<Title order={3} size="h4">
						1.2 Link Data
					</Title>
					<Text>When you create shortened links, the following is stored:</Text>
					<List>
						<List.Item>Original (destination) URLs</List.Item>
						<List.Item>Custom aliases (if provided)</List.Item>
						<List.Item>Link titles and descriptions</List.Item>
						<List.Item>Tags and organizational data</List.Item>
						<List.Item>Password hashes (for protected links)</List.Item>
						<List.Item>Scheduling and expiration settings</List.Item>
					</List>

					<Title order={3} size="h4">
						1.3 Analytics Data
					</Title>
					<Text>
						When someone clicks your shortened links, the following is
						collected:
					</Text>
					<List>
						<List.Item>IP address (anonymized after processing)</List.Item>
						<List.Item>Browser type and version</List.Item>
						<List.Item>Operating system and device type</List.Item>
						<List.Item>Referring website</List.Item>
						<List.Item>Geographic location (country/city level)</List.Item>
						<List.Item>Date and time of access</List.Item>
						<List.Item>UTM parameters (if present)</List.Item>
					</List>

					<Title order={3} size="h4">
						1.4 Guest User Data
					</Title>
					<Text>For users creating links without an account:</Text>
					<List>
						<List.Item>IP address (for rate limiting)</List.Item>
						<List.Item>User agent string</List.Item>
					</List>
				</Stack>

				{/* How Information Is Used */}
				<Stack gap="md">
					<Title order={2}>2. How Your Information Is Used</Title>
					<Text>The collected information is used to:</Text>
					<List>
						<List.Item>
							Provide and maintain the URL shortening service
						</List.Item>
						<List.Item>
							Generate analytics and insights for your links
						</List.Item>
						<List.Item>
							Scan URLs for security threats using AI-powered analysis
						</List.Item>
						<List.Item>Process payments and manage subscriptions</List.Item>
						<List.Item>Send service-related emails and notifications</List.Item>
						<List.Item>Prevent abuse, fraud, and enforce rate limits</List.Item>
						<List.Item>Improve and optimize the service</List.Item>
						<List.Item>Comply with legal obligations</List.Item>
					</List>
				</Stack>

				{/* Data Retention */}
				<Stack gap="md">
					<Title order={2}>3. Data Retention</Title>
					<Text>Your data is retained based on your account type:</Text>
					<Table withTableBorder withColumnBorders mt="md">
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Account Type</Table.Th>
								<Table.Th>Link Retention</Table.Th>
								<Table.Th>Analytics Retention</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							<Table.Tr>
								<Table.Td>Guest (No Account)</Table.Td>
								<Table.Td>3 days</Table.Td>
								<Table.Td>3 days</Table.Td>
							</Table.Tr>
							<Table.Tr>
								<Table.Td>Free Account</Table.Td>
								<Table.Td>90 days</Table.Td>
								<Table.Td>90 days</Table.Td>
							</Table.Tr>
							<Table.Tr>
								<Table.Td>Pro Account</Table.Td>
								<Table.Td>2 years</Table.Td>
								<Table.Td>2 years</Table.Td>
							</Table.Tr>
						</Table.Tbody>
					</Table>
					<Text mt="sm">
						Account information is retained until you delete your account.
						Deleted data may be retained in backups for up to 30 days.
					</Text>
				</Stack>

				{/* Third-Party Services */}
				<Stack gap="md">
					<Title order={2}>4. Third-Party Services</Title>
					<Text>Minifi uses the following third-party services:</Text>

					<Title order={3} size="h4">
						4.1 Authentication (Keycloak)
					</Title>
					<Text>
						Keycloak handles secure authentication. Your login credentials are
						managed by Keycloak and never stored directly in the database.
					</Text>

					<Title order={3} size="h4">
						4.2 Payment Processing (Stripe)
					</Title>
					<Text>
						Payment information is processed by Stripe (used for demo/testing
						purposes in this portfolio project). Credit card details are not
						stored. Please review{" "}
						<Anchor href="https://stripe.com/privacy" target="_blank">
							Stripe's Privacy Policy
						</Anchor>
						.
					</Text>

					<Title order={3} size="h4">
						4.3 Security Scanning (OpenAI)
					</Title>
					<Text>
						OpenAI's API analyzes URLs for potential security threats, malware,
						phishing attempts, and adult content. Only the destination URL is
						sent for analysis; no personal data is shared.
					</Text>

					<Title order={3} size="h4">
						4.4 Email Delivery (Resend)
					</Title>
					<Text>
						Transactional emails are delivered via Resend. Your email address is
						shared with Resend solely for email delivery purposes.
					</Text>
				</Stack>

				{/* Cookies */}
				<Stack gap="md">
					<Title order={2}>5. Cookies and Local Storage</Title>
					<Text>Cookies and local storage are used for:</Text>
					<List>
						<List.Item>
							<strong>Authentication:</strong> Maintaining your logged-in
							session
						</List.Item>
						<List.Item>
							<strong>Preferences:</strong> Remembering your theme and display
							settings
						</List.Item>
						<List.Item>
							<strong>Security:</strong> Preventing cross-site request forgery
						</List.Item>
					</List>
					<Text>
						No tracking cookies or third-party advertising cookies are used.
					</Text>
				</Stack>

				{/* Data Sharing */}
				<Stack gap="md">
					<Title order={2}>6. Data Sharing and Disclosure</Title>
					<Text>
						Your personal information is not sold. Data may be shared:
					</Text>
					<List>
						<List.Item>
							With service providers that help operate the service (as described
							in Section 4)
						</List.Item>
						<List.Item>
							To comply with legal obligations or government requests
						</List.Item>
					</List>
				</Stack>

				{/* Your Rights */}
				<Stack gap="md">
					<Title order={2}>7. Your Rights</Title>
					<Text>You have the right to:</Text>
					<List>
						<List.Item>
							<strong>Access:</strong> Request a copy of your personal data
						</List.Item>
						<List.Item>
							<strong>Correction:</strong> Update inaccurate or incomplete data
						</List.Item>
						<List.Item>
							<strong>Deletion:</strong> Request deletion of your account and
							associated data
						</List.Item>
						<List.Item>
							<strong>Export:</strong> Download your data in a portable format
						</List.Item>
						<List.Item>
							<strong>Opt-out:</strong> Unsubscribe from marketing
							communications
						</List.Item>
					</List>
					<Text>
						To exercise these rights, contact me at{" "}
						<Anchor href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Anchor>.
					</Text>
				</Stack>

				{/* Security */}
				<Stack gap="md">
					<Title order={2}>8. Security</Title>
					<Text>Security measures implemented include:</Text>
					<List>
						<List.Item>HTTPS encryption for all data transmission</List.Item>
						<List.Item>Bcrypt hashing for password-protected links</List.Item>
						<List.Item>Rate limiting to prevent abuse</List.Item>
						<List.Item>Secure database storage</List.Item>
					</List>
					<Text>
						While efforts are made to protect your data, no method of
						transmission over the Internet is 100% secure.
					</Text>
				</Stack>

				{/* Children's Privacy */}
				<Stack gap="md">
					<Title order={2}>9. Children's Privacy</Title>
					<Text>
						Minifi is not intended for users under 13 years of age. Personal
						information is not knowingly collected from children. If you believe
						a child has provided personal data, please contact me immediately.
					</Text>
				</Stack>

				{/* International Users */}
				<Stack gap="md">
					<Title order={2}>10. International Data Transfers</Title>
					<Text>
						Your data may be transferred to and processed in countries other
						than your own. Appropriate safeguards are in place to protect your
						data in accordance with this Privacy Policy.
					</Text>
				</Stack>

				{/* Changes */}
				<Stack gap="md">
					<Title order={2}>11. Changes to This Policy</Title>
					<Text>
						This Privacy Policy may be updated from time to time. Significant
						changes will be communicated via email or through a notice on the
						website. Your continued use of Minifi after changes constitutes
						acceptance of the updated policy.
					</Text>
				</Stack>

				{/* Contact */}
				<Stack gap="md">
					<Title order={2}>12. Contact</Title>
					<Text>
						If you have questions about this Privacy Policy, please contact:
					</Text>
					<List>
						<List.Item>
							Email:{" "}
							<Anchor href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Anchor>
						</List.Item>
					</List>
				</Stack>

				<Divider />

				{/* Footer navigation */}
				<Text c="dimmed" ta="center">
					<Anchor component={Link} to="/">
						Back to Home
					</Anchor>
					{" | "}
					<Anchor component={Link} to="/terms">
						Terms of Service
					</Anchor>
				</Text>
			</Stack>
		</Container>
	);
}
