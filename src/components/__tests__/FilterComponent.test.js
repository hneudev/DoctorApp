import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import FilterComponent from "../FilterComponent";

describe("FilterComponent", () => {
	const mockSpecialties = ["Cardiology", "Dermatology", "Pediatrics"];
	const mockCurrentFilter = [""];
	const mockOnFilterChange = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test("renders filter button with correct initial text", () => {
		render(
			<FilterComponent
				specialties={mockSpecialties}
				currentFilter={mockCurrentFilter}
				onFilterChange={mockOnFilterChange}
				id='test-filter'
			/>
		);

		const button = screen.getByRole("button");
		expect(button).toHaveTextContent("All Specialties");
	});

	test("opens and closes dropdown when clicking filter button", async () => {
		render(
			<FilterComponent
				specialties={mockSpecialties}
				currentFilter={mockCurrentFilter}
				onFilterChange={mockOnFilterChange}
				id='test-filter'
			/>
		);

		const button = screen.getByRole("button");

		// Click to open dropdown
		fireEvent.click(button);
		expect(screen.getByRole("listbox")).toBeInTheDocument();

		// Click again to close dropdown
		fireEvent.click(button);
		await waitFor(() => {
			expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		});
	});

	test("displays correct options in dropdown", () => {
		render(
			<FilterComponent
				specialties={mockSpecialties}
				currentFilter={mockCurrentFilter}
				onFilterChange={mockOnFilterChange}
				id='test-filter'
			/>
		);

		const button = screen.getByRole("button");
		fireEvent.click(button);

		// Use getAllByText for "All Specialties" since it appears multiple times
		const allSpecialtiesOptions = screen.getAllByText("All Specialties");
		expect(allSpecialtiesOptions.length).toBeGreaterThan(0);

		mockSpecialties.forEach((specialty) => {
			expect(screen.getByText(specialty)).toBeInTheDocument();
		});
	});

	test("calls onFilterChange when selecting an option", () => {
		render(
			<FilterComponent
				specialties={mockSpecialties}
				currentFilter={mockCurrentFilter}
				onFilterChange={mockOnFilterChange}
				id='test-filter'
			/>
		);

		const button = screen.getByRole("button");
		fireEvent.click(button);

		const option = screen.getByText("Cardiology");
		fireEvent.click(option);

		expect(mockOnFilterChange).toHaveBeenCalledWith(["Cardiology"]);
	});

	test("supports keyboard navigation", async () => {
		render(
			<FilterComponent
				specialties={mockSpecialties}
				currentFilter={mockCurrentFilter}
				onFilterChange={mockOnFilterChange}
				id='test-filter'
			/>
		);

		const button = screen.getByRole("button");

		// Open dropdown with Enter key
		fireEvent.keyDown(button, { key: "Enter" });
		expect(screen.getByRole("listbox")).toBeInTheDocument();

		// Navigate through options with arrow keys
		const listbox = screen.getByRole("listbox");
		fireEvent.keyDown(listbox, { key: "ArrowDown" });

		// Close dropdown with Escape key
		fireEvent.keyDown(listbox, { key: "Escape" });
		await waitFor(() => {
			expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
		});
	});

	test("maintains accessibility attributes", () => {
		render(
			<FilterComponent
				specialties={mockSpecialties}
				currentFilter={mockCurrentFilter}
				onFilterChange={mockOnFilterChange}
				id='test-filter'
			/>
		);

		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("aria-expanded", "false");
		expect(button).toHaveAttribute("aria-haspopup", "listbox");
		expect(button).toHaveAttribute("aria-labelledby", "test-filter-label");

		fireEvent.click(button);
		expect(button).toHaveAttribute("aria-expanded", "true");

		const listbox = screen.getByRole("listbox");
		expect(listbox).toHaveAttribute("aria-labelledby", "test-filter-label");
		expect(listbox).toHaveAttribute("aria-multiselectable", "true");
	});
});
