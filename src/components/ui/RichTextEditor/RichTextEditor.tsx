import { Box, InputLabel, Text } from "@mantine/core";
import { Link, RichTextEditor as MantineRTE } from "@mantine/tiptap";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import type { Editor } from "@tiptap/react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

export interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	label?: string;
	description?: string;
	error?: string;
	minHeight?: number;
}

export function RichTextEditor({
	value,
	onChange,
	label,
	description,
	error,
	minHeight = 200,
}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Link,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			Highlight,
			TextStyle,
			Color,
		],
		content: value,
		onUpdate: ({ editor: ed }: { editor: Editor }) => {
			onChange(ed.getHTML());
		},
	});

	// Sync external value changes
	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value);
		}
	}, [value, editor]);

	return (
		<Box>
			{label && <InputLabel mb={4}>{label}</InputLabel>}
			{description && (
				<Text size="xs" c="dimmed" mb={4}>
					{description}
				</Text>
			)}
			<MantineRTE
				editor={editor}
				style={{
					minHeight,
					borderColor: error ? "var(--mantine-color-red-6)" : undefined,
				}}
			>
				<MantineRTE.Toolbar sticky stickyOffset={60}>
					<MantineRTE.ControlsGroup>
						<MantineRTE.Bold />
						<MantineRTE.Italic />
						<MantineRTE.Underline />
						<MantineRTE.Strikethrough />
						<MantineRTE.Highlight />
						<MantineRTE.ClearFormatting />
					</MantineRTE.ControlsGroup>

					<MantineRTE.ControlsGroup>
						<MantineRTE.H2 />
						<MantineRTE.H3 />
						<MantineRTE.H4 />
					</MantineRTE.ControlsGroup>

					<MantineRTE.ControlsGroup>
						<MantineRTE.BulletList />
						<MantineRTE.OrderedList />
					</MantineRTE.ControlsGroup>

					<MantineRTE.ControlsGroup>
						<MantineRTE.AlignLeft />
						<MantineRTE.AlignCenter />
						<MantineRTE.AlignRight />
						<MantineRTE.AlignJustify />
					</MantineRTE.ControlsGroup>

					<MantineRTE.ControlsGroup>
						<MantineRTE.Link />
						<MantineRTE.Unlink />
					</MantineRTE.ControlsGroup>

					<MantineRTE.ControlsGroup>
						<MantineRTE.Undo />
						<MantineRTE.Redo />
					</MantineRTE.ControlsGroup>
				</MantineRTE.Toolbar>

				<MantineRTE.Content style={{ minHeight: minHeight - 50 }} />
			</MantineRTE>
			{error && (
				<Text size="xs" c="red" mt={4}>
					{error}
				</Text>
			)}
		</Box>
	);
}
