import { Button, type ButtonProps } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { useState } from "react";

export interface CopyButtonProps extends Omit<ButtonProps, "onClick"> {
	value: string;
	label?: string;
}

/**
 * Simple copy-to-clipboard button with optimistic UI feedback.
 */
export function CopyButton({ value, label, ...props }: CopyButtonProps) {
	const clipboard = useClipboard({ timeout: 1500 });
	const [copiedLabel, setCopiedLabel] = useState("");

	const handleCopy = () => {
		setCopiedLabel(label ?? value);
		clipboard.copy(value);
	};

	return (
		<Button
			leftSection={
				clipboard.copied ? <IconCheck size={16} /> : <IconCopy size={16} />
			}
			color={clipboard.copied ? "teal" : "blue"}
			variant={clipboard.copied ? "light" : "filled"}
			onClick={handleCopy}
			{...props}
		>
			{clipboard.copied ? "Copied!" : (props.children ?? "Copy")}
			{clipboard.copied && copiedLabel ? ` ${copiedLabel}` : null}
		</Button>
	);
}
