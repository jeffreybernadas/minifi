import {
	Box,
	Button,
	Card,
	Container,
	Divider,
	Group,
	Paper,
	SimpleGrid,
	Stack,
	Text,
	ThemeIcon,
	Timeline,
	Title,
} from "@mantine/core";
import {
	IconChartBar,
	IconClock,
	IconLink,
	IconLock,
	IconQrcode,
	IconRocket,
	IconShieldCheck,
	IconTags,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreateGuestLinkForm } from "@/components/links";
import { PricingCards } from "@/components/ui";
import { keycloak } from "@/features/auth";
import { useAuth } from "@/hooks";

// Features data
const FEATURES = [
	{
		icon: IconChartBar,
		title: "Detailed Analytics",
		description:
			"Track clicks, geographic data, devices, browsers, and referrers in real-time.",
	},
	{
		icon: IconQrcode,
		title: "QR Code Generation",
		description:
			"Generate QR codes instantly for any shortened link. Perfect for print and offline.",
	},
	{
		icon: IconLock,
		title: "Password Protection",
		description:
			"Secure sensitive links with passwords. Only those who know can access.",
	},
	{
		icon: IconClock,
		title: "Link Scheduling",
		description:
			"Set start and expiration dates. Control exactly when your links are active.",
	},
	{
		icon: IconShieldCheck,
		title: "Security Scanning",
		description:
			"AI-powered malicious URL detection keeps you and your audience safe.",
	},
	{
		icon: IconTags,
		title: "Custom Tags",
		description:
			"Organize links with custom colored tags. Filter and find links instantly.",
	},
	{
		icon: IconLink,
		title: "Custom Aliases",
		description:
			"Create branded, memorable short URLs. Turn long URLs into minifi-url.vercel.app/my-brand.",
	},
	{
		icon: IconRocket,
		title: "One-Time Links",
		description:
			"Links that self-destruct after the first click. Perfect for sensitive content.",
	},
];

// Stats (static for now, can be dynamic later)
const STATS = [
	{ value: "10K+", label: "Links Shortened" },
	{ value: "50K+", label: "Clicks Tracked" },
	{ value: "1K+", label: "Happy Users" },
];

export default function LandingPage() {
	const { isAuthenticated, isInitialized } = useAuth();
	const navigate = useNavigate();

	// Redirect authenticated users to dashboard
	useEffect(() => {
		if (isAuthenticated) {
			navigate("/dashboard", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	const handleSignUp = () => {
		keycloak.login();
	};

	// Don't render landing page content if not initialized or if authenticated
	// This prevents flash of landing page before redirect
	if (!isInitialized || isAuthenticated) {
		return null;
	}

	return (
		<Stack gap={80}>
			{/* Hero Section */}
			<Box component="section" py="xl">
				<Stack gap="xl" align="center" ta="center">
					<Stack gap="sm" maw={600}>
						<Title order={1} size="3rem" fw={800} lh={1.2}>
							Shorten. Track.{" "}
							<Text
								component="span"
								inherit
								variant="gradient"
								gradient={{ from: "blue", to: "violet", deg: 90 }}
							>
								Grow.
							</Text>
						</Title>
						<Text size="xl" c="dimmed">
							Transform long URLs into powerful short links with analytics, QR
							codes, security scanning and more! Free to start.
						</Text>
					</Stack>

					<Box w="100%" maw={700}>
						<CreateGuestLinkForm />
					</Box>
				</Stack>
			</Box>

			{/* Stats Bar */}
			<Paper withBorder radius="lg" p="xl">
				<SimpleGrid cols={{ base: 1, sm: 3 }}>
					{STATS.map((stat) => (
						<Stack key={stat.label} align="center" gap={4}>
							<Text size="2rem" fw={700} c="blue">
								{stat.value}
							</Text>
							<Text size="sm" c="dimmed">
								{stat.label}
							</Text>
						</Stack>
					))}
				</SimpleGrid>
			</Paper>

			{/* Features Grid */}
			<Box component="section">
				<Stack gap="xl">
					<Stack gap="xs" ta="center">
						<Title order={2}>Everything you need</Title>
						<Text c="dimmed" maw={500} mx="auto">
							Powerful features to help you manage, track, and optimize your
							links.
						</Text>
					</Stack>

					<SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
						{FEATURES.map((feature) => (
							<Card key={feature.title} withBorder padding="lg" radius="md">
								<Stack gap="sm">
									<ThemeIcon size={40} radius="md" variant="light" color="blue">
										<feature.icon size={22} />
									</ThemeIcon>
									<Text fw={600}>{feature.title}</Text>
									<Text size="sm" c="dimmed">
										{feature.description}
									</Text>
								</Stack>
							</Card>
						))}
					</SimpleGrid>
				</Stack>
			</Box>

			{/* How It Works */}
			<Box component="section">
				<Stack gap="xl">
					<Stack gap="xs" ta="center">
						<Title order={2}>How it works</Title>
						<Text c="dimmed">
							Three simple steps to shorter, smarter links.
						</Text>
					</Stack>

					<Container size="sm">
						<Timeline active={-1} bulletSize={36} lineWidth={2}>
							<Timeline.Item
								bullet={
									<Text fw={700} size="sm">
										1
									</Text>
								}
								title="Paste your URL"
							>
								<Text c="dimmed" size="sm" mt={4}>
									Drop in any long URL you want to shorten. We accept links from
									anywhere.
								</Text>
							</Timeline.Item>

							<Timeline.Item
								bullet={
									<Text fw={700} size="sm">
										2
									</Text>
								}
								title="Customize (optional)"
							>
								<Text c="dimmed" size="sm" mt={4}>
									Add a custom alias, password, expiration date, or tags to
									organize your links.
								</Text>
							</Timeline.Item>

							<Timeline.Item
								bullet={
									<Text fw={700} size="sm">
										3
									</Text>
								}
								title="Share & track"
							>
								<Text c="dimmed" size="sm" mt={4}>
									Copy your short link, share it anywhere, and watch the
									analytics roll in.
								</Text>
							</Timeline.Item>
						</Timeline>
					</Container>
				</Stack>
			</Box>

			{/* Pricing Section */}
			<Box component="section">
				<Stack gap="xl">
					<Stack gap="xs" ta="center">
						<Title order={2}>Simple, transparent pricing</Title>
						<Text c="dimmed">Start free. Upgrade when you need more.</Text>
					</Stack>

					<PricingCards onSignUp={handleSignUp} />
				</Stack>
			</Box>

			{/* Final CTA */}
			<Paper
				withBorder
				radius="lg"
				p="xl"
				style={{
					background:
						"linear-gradient(135deg, var(--mantine-color-blue-light) 0%, var(--mantine-color-violet-light) 100%)",
				}}
			>
				<Stack gap="lg" align="center" ta="center">
					<Stack gap="xs">
						<Title order={2}>Ready to shorten smarter?</Title>
						<Text c="dimmed" maw={400}>
							Join thousands of users who trust Minifi for their link management
							needs.
						</Text>
					</Stack>

					<Group justify="center" wrap="wrap">
						<Button
							size="lg"
							variant="gradient"
							gradient={{ from: "blue", to: "violet" }}
							onClick={handleSignUp}
						>
							Get Started Free
						</Button>
						<Button size="lg" variant="outline" onClick={handleSignUp}>
							View Plans
						</Button>
					</Group>
				</Stack>
			</Paper>

			<Divider />
		</Stack>
	);
}
