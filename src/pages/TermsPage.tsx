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

export default function TermsPage() {
	return (
		<Container size="md" py="xl">
			<Stack gap="xl">
				{/* Header */}
				<Box>
					<Title order={1}>Terms of Service</Title>
					<Text c="dimmed" mt="xs">
						Last updated: {LAST_UPDATED}
					</Text>
				</Box>

				<Divider />

				{/* Introduction */}
				<Stack gap="md">
					<Text>
						Welcome to Minifi, a personal portfolio project created and
						maintained by a solo developer. These Terms of Service ("Terms")
						govern your use of this URL shortening service. By accessing or
						using Minifi, you agree to be bound by these Terms.
					</Text>
					<Text>
						Please read these Terms carefully before using the service. If you
						do not agree to these Terms, you may not use Minifi.
					</Text>
				</Stack>

				{/* Definitions */}
				<Stack gap="md">
					<Title order={2}>1. Definitions</Title>
					<List>
						<List.Item>
							<strong>"Service"</strong> refers to the Minifi URL shortening
							platform, including the website, API, and all related services.
						</List.Item>
						<List.Item>
							<strong>"User"</strong> refers to any individual or entity that
							accesses or uses the Service.
						</List.Item>
						<List.Item>
							<strong>"Link"</strong> refers to a shortened URL created through
							the Service.
						</List.Item>
						<List.Item>
							<strong>"Content"</strong> refers to any URLs, text, images, or
							other materials submitted through the Service.
						</List.Item>
					</List>
				</Stack>

				{/* Account Types */}
				<Stack gap="md">
					<Title order={2}>2. Service Tiers</Title>
					<Text>
						Minifi offers different service tiers with varying features:
					</Text>
					<Table withTableBorder withColumnBorders mt="md">
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Feature</Table.Th>
								<Table.Th>Guest</Table.Th>
								<Table.Th>Free</Table.Th>
								<Table.Th>Pro</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							<Table.Tr>
								<Table.Td>Links</Table.Td>
								<Table.Td>5/day</Table.Td>
								<Table.Td>25 total</Table.Td>
								<Table.Td>Unlimited</Table.Td>
							</Table.Tr>
							<Table.Tr>
								<Table.Td>Link Retention</Table.Td>
								<Table.Td>3 days</Table.Td>
								<Table.Td>90 days</Table.Td>
								<Table.Td>2 years</Table.Td>
							</Table.Tr>
							<Table.Tr>
								<Table.Td>Custom Aliases</Table.Td>
								<Table.Td>No</Table.Td>
								<Table.Td>No</Table.Td>
								<Table.Td>Yes</Table.Td>
							</Table.Tr>
							<Table.Tr>
								<Table.Td>Analytics</Table.Td>
								<Table.Td>Basic</Table.Td>
								<Table.Td>Standard</Table.Td>
								<Table.Td>Advanced</Table.Td>
							</Table.Tr>
						</Table.Tbody>
					</Table>
				</Stack>

				{/* Acceptable Use */}
				<Stack gap="md">
					<Title order={2}>3. Acceptable Use</Title>
					<Text>
						You agree to use Minifi only for lawful purposes. You may NOT use
						the Service to:
					</Text>
					<List>
						<List.Item>
							Shorten URLs that lead to malware, viruses, or other harmful
							software
						</List.Item>
						<List.Item>
							Create links to phishing sites or fraudulent content
						</List.Item>
						<List.Item>
							Distribute illegal content, including but not limited to pirated
							materials, illegal drugs, or weapons
						</List.Item>
						<List.Item>
							Share child sexual abuse material (CSAM) or exploit minors in any
							way
						</List.Item>
						<List.Item>
							Engage in harassment, hate speech, or discrimination
						</List.Item>
						<List.Item>
							Violate intellectual property rights of others
						</List.Item>
						<List.Item>
							Spam, including creating bulk links for unsolicited advertising
						</List.Item>
						<List.Item>
							Circumvent security measures or abuse rate limits
						</List.Item>
						<List.Item>
							Impersonate others or create misleading redirects
						</List.Item>
						<List.Item>
							Interfere with or disrupt the Service or servers
						</List.Item>
					</List>
				</Stack>

				{/* Security Scanning */}
				<Stack gap="md">
					<Title order={2}>4. Security Scanning</Title>
					<Text>
						All URLs submitted to Minifi are automatically scanned for security
						threats using AI-powered analysis. Links may be flagged as:
					</Text>
					<List>
						<List.Item>
							<strong>Safe:</strong> No security concerns detected
						</List.Item>
						<List.Item>
							<strong>Suspicious:</strong> Potential risks identified; users
							will see a warning
						</List.Item>
						<List.Item>
							<strong>Malicious:</strong> Confirmed security threat; link may be
							blocked
						</List.Item>
						<List.Item>
							<strong>Adult Content:</strong> Contains adult/NSFW material;
							users will see a warning
						</List.Item>
					</List>
					<Text>
						Links that violate these Terms or pose a security risk may be
						blocked, disabled, or removed.
					</Text>
				</Stack>

				{/* Account Responsibilities */}
				<Stack gap="md">
					<Title order={2}>5. Account Responsibilities</Title>
					<Text>If you create an account, you are responsible for:</Text>
					<List>
						<List.Item>
							Maintaining the confidentiality of your account credentials
						</List.Item>
						<List.Item>All activities that occur under your account</List.Item>
						<List.Item>
							Notifying us immediately of any unauthorized access
						</List.Item>
						<List.Item>
							Providing accurate and current account information
						</List.Item>
					</List>
				</Stack>

				{/* Payments and Subscriptions */}
				<Stack gap="md">
					<Title order={2}>6. Payments and Subscriptions</Title>
					<Text>
						Pro subscriptions are processed through Stripe. Note: This is a
						portfolio project and Stripe is configured in test mode for
						demonstration purposes.
					</Text>
					<List>
						<List.Item>
							Subscriptions automatically renew unless cancelled before the
							renewal date
						</List.Item>
						<List.Item>
							You may cancel your subscription at any time through your account
							settings
						</List.Item>
						<List.Item>
							Upon downgrade or cancellation, Pro features become unavailable at
							the end of the billing period
						</List.Item>
					</List>
				</Stack>

				{/* Intellectual Property */}
				<Stack gap="md">
					<Title order={2}>7. Intellectual Property</Title>
					<Text>
						The Minifi service, including its design, logos, and software, is
						owned by us and protected by intellectual property laws. You retain
						ownership of the content you submit.
					</Text>
					<Text>
						By using the Service, you grant us a limited license to process,
						store, and display your shortened links as necessary to operate the
						Service.
					</Text>
				</Stack>

				{/* Termination */}
				<Stack gap="md">
					<Title order={2}>8. Termination</Title>
					<Text>
						Access to the Service may be suspended or terminated if you:
					</Text>
					<List>
						<List.Item>Violate these Terms of Service</List.Item>
						<List.Item>Engage in abusive or fraudulent behavior</List.Item>
						<List.Item>Create links that harm users or the Service</List.Item>
					</List>
					<Text>
						Upon termination, your right to use the Service ceases immediately.
						Your account and associated data may be deleted in accordance with
						the Privacy Policy.
					</Text>
				</Stack>

				{/* Disclaimers */}
				<Stack gap="md">
					<Title order={2}>9. Disclaimers</Title>
					<Text>
						This is a personal portfolio project. THE SERVICE IS PROVIDED "AS
						IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
						IMPLIED.
					</Text>
					<Text>No warranty is made that:</Text>
					<List>
						<List.Item>
							The Service will be uninterrupted, secure, or error-free
						</List.Item>
						<List.Item>Links will remain accessible indefinitely</List.Item>
						<List.Item>Security scanning will detect all threats</List.Item>
						<List.Item>
							The Service will meet your specific requirements
						</List.Item>
					</List>
				</Stack>

				{/* Limitation of Liability */}
				<Stack gap="md">
					<Title order={2}>10. Limitation of Liability</Title>
					<Text>
						As this is a personal portfolio project, liability is limited to the
						maximum extent permitted by law. The developer shall not be liable
						for any indirect, incidental, special, consequential, or punitive
						damages, including but not limited to:
					</Text>
					<List>
						<List.Item>Loss of data</List.Item>
						<List.Item>Service interruption or link unavailability</List.Item>
						<List.Item>Unauthorized access to your account</List.Item>
						<List.Item>Actions of third parties accessing your links</List.Item>
					</List>
				</Stack>

				{/* Indemnification */}
				<Stack gap="md">
					<Title order={2}>11. Indemnification</Title>
					<Text>
						You agree to indemnify and hold harmless the developer from any
						claims, damages, losses, or expenses arising from:
					</Text>
					<List>
						<List.Item>Your use of the Service</List.Item>
						<List.Item>Your violation of these Terms</List.Item>
						<List.Item>Content you submit or links you create</List.Item>
						<List.Item>Your violation of any third-party rights</List.Item>
					</List>
				</Stack>

				{/* Modifications */}
				<Stack gap="md">
					<Title order={2}>12. Modifications to Terms</Title>
					<Text>
						These Terms may be modified at any time. Material changes will be
						communicated via email or through the Service. Your continued use
						after changes take effect constitutes acceptance of the modified
						Terms.
					</Text>
				</Stack>

				{/* Governing Law */}
				<Stack gap="md">
					<Title order={2}>13. Governing Law</Title>
					<Text>
						These Terms shall be governed by and construed in accordance with
						applicable laws. Any disputes arising from these Terms or the
						Service shall be resolved through binding arbitration or in the
						courts of competent jurisdiction.
					</Text>
				</Stack>

				{/* Severability */}
				<Stack gap="md">
					<Title order={2}>14. Severability</Title>
					<Text>
						If any provision of these Terms is found to be unenforceable, the
						remaining provisions shall continue in full force and effect.
					</Text>
				</Stack>

				{/* Contact */}
				<Stack gap="md">
					<Title order={2}>15. Contact</Title>
					<Text>
						If you have questions about these Terms of Service, please contact:
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
					<Anchor component={Link} to="/privacy">
						Privacy Policy
					</Anchor>
				</Text>
			</Stack>
		</Container>
	);
}
