import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("App", () => {
	it("renders main UI and increments counter", async () => {
		render(<App />);

		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
			"Vite + React",
		);
		expect(
			screen.getByRole("link", { name: /vite logo/i }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /react logo/i }),
		).toBeInTheDocument();

		const button = screen.getByRole("button", { name: /count is/i });
		expect(button).toHaveTextContent("count is 0");

		await userEvent.click(button);

		expect(button).toHaveTextContent("count is 1");
	});
});
