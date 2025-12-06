import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("App", () => {
	it("walks through the stepper flow", async () => {
		const user = userEvent.setup();
		render(<App />);

		expect(
			screen.getByText("Step 2 content: Verify email"),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Back" }));
		expect(
			screen.getByText("Step 1 content: Create an account"),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Next step" }));
		expect(
			screen.getByText("Step 2 content: Verify email"),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Next step" }));
		expect(
			screen.getByText("Step 3 content: Get full access"),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Next step" }));
		expect(
			screen.getByText("Completed, click back button to get to previous step"),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Back" }));
		expect(
			screen.getByText("Step 3 content: Get full access"),
		).toBeInTheDocument();
	});
});
