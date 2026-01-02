import { Box, Button, Center, Image, Paper, Stack, Text } from "@mantine/core";
import { useState } from "react";
import type { Link } from "@/types";

export interface LinkQrCardProps {
	link: Link;
	onGenerate?: () => void;
	loading?: boolean;
}

export function LinkQrCard({
	link,
	onGenerate,
	loading,
}: Readonly<LinkQrCardProps>) {
	const [isDownloading, setIsDownloading] = useState(false);

	// Helper to handle various QR code URL formats
	const getQrSrc = (qrData: string) => {
		// If it's already a data URI, use it as is
		if (qrData.startsWith("data:image")) return qrData;

		// If it's a full URL with protocol, use it as is
		if (qrData.startsWith("http://") || qrData.startsWith("https://"))
			return qrData;

		// If it looks like a domain path (e.g. storage.lunarix.site/...), assume https
		if (qrData.includes(".") && qrData.includes("/"))
			return `https://${qrData}`;

		// Otherwise fallback to base64 data URI assumption
		return `data:image/png;base64,${qrData}`;
	};

	const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (!link.qrCodeUrl) return;

		const src = getQrSrc(link.qrCodeUrl);

		// If it's a data URI, let the default download behavior happen
		if (src.startsWith("data:")) return;

		e.preventDefault();
		setIsDownloading(true);

		try {
			const response = await fetch(src);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `${link.customAlias ?? link.shortCode}-qr.png`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (error) {
			console.error("Failed to download QR code:", error);
			// Fallback to opening in new tab if fetch fails
			window.open(src, "_blank");
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<Paper withBorder p="md" radius="md">
			<Stack gap="sm">
				<Text fw={600}>QR Code</Text>
				<Box style={{ minHeight: 280 }}>
					<Center h="100%" style={{ minHeight: 280 }}>
						{link.qrCodeUrl ? (
							<Stack gap="md" align="center" w="100%">
								<Image
									src={getQrSrc(link.qrCodeUrl)}
									alt="QR code"
									radius="md"
									w={200}
									h={200}
									fit="contain"
								/>
								<Button
									component="a"
									href={getQrSrc(link.qrCodeUrl)}
									download={`${link.customAlias ?? link.shortCode}-qr.png`}
									target="_blank"
									variant="light"
									fullWidth
									onClick={handleDownload}
									loading={isDownloading}
								>
									Download
								</Button>
							</Stack>
						) : (
							<Stack gap="md" align="center" w="100%">
								<Text size="sm" c="dimmed" ta="center">
									No QR code has been generated yet.
								</Text>
								<Button
									onClick={onGenerate}
									loading={loading}
									disabled={!onGenerate}
									fullWidth
								>
									Generate QR Code
								</Button>
							</Stack>
						)}
					</Center>
				</Box>
			</Stack>
		</Paper>
	);
}
