import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import AppointmentsSummary from "../AppointmentsSummary";

describe("AppointmentsSummary", () => {
	const mockAppointments = [
		{
			id: 1,
			doctor: {
				name: "Dr. Smith",
				specialty: "Cardiology",
			},
			timeSlot: "10:00 AM",
		},
		{
			id: 2,
			doctor: {
				name: "Dr. Johnson",
				specialty: "Dermatology",
			},
			timeSlot: "2:30 PM",
		},
	];

	const mockOnUnschedule = jest.fn();
	const mockOnToggleExpand = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		// Mock window.innerWidth
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 1024,
		});
	});

	test("renders appointment list correctly", () => {
		render(
			<AppointmentsSummary
				appointments={mockAppointments}
				onUnschedule={mockOnUnschedule}
				isExpanded={true}
				onToggleExpand={mockOnToggleExpand}
			/>
		);

		mockAppointments.forEach((appointment) => {
			expect(screen.getByText(appointment.doctor.name)).toBeInTheDocument();
			expect(screen.getByText(appointment.doctor.specialty)).toBeInTheDocument();
			expect(screen.getByText(`Time: ${appointment.timeSlot}`)).toBeInTheDocument();
		});
	});

	test("displays empty state when no appointments", () => {
		render(
			<AppointmentsSummary
				appointments={[]}
				onUnschedule={mockOnUnschedule}
				isExpanded={true}
				onToggleExpand={mockOnToggleExpand}
			/>
		);

		expect(screen.getByText("No appointments scheduled")).toBeInTheDocument();
	});

	test("handles unschedule click and confirmation modal", () => {
		render(
			<AppointmentsSummary
				appointments={mockAppointments}
				onUnschedule={mockOnUnschedule}
				isExpanded={true}
				onToggleExpand={mockOnToggleExpand}
			/>
		);

		const unscheduleButton = screen.getAllByText("Unschedule")[0];
		fireEvent.click(unscheduleButton);

		// Check if confirmation modal appears
		expect(screen.getByText("Unschedule Appointment")).toBeInTheDocument();
		expect(screen.getByText(/Are you sure you want to unschedule your appointment with/)).toBeInTheDocument();

		// Test modal confirmation
		const confirmButton = screen.getByRole("button", { name: "Confirm" });
		fireEvent.click(confirmButton);
		expect(mockOnUnschedule).toHaveBeenCalledWith(mockAppointments[0].id);

		// Test modal cancellation
		const unscheduleButton2 = screen.getAllByText("Unschedule")[1];
		fireEvent.click(unscheduleButton2);
		const closeButton = screen.getByRole("button", { name: "Close unschedule appointment confirmation modal" });
		fireEvent.click(closeButton);
		expect(mockOnUnschedule).toHaveBeenCalledTimes(1); // Should not increase
	});

	test("handles expand/collapse toggle", () => {
		render(
			<AppointmentsSummary
				appointments={mockAppointments}
				onUnschedule={mockOnUnschedule}
				isExpanded={true}
				onToggleExpand={mockOnToggleExpand}
			/>
		);

		const toggleButton = screen.getByRole("button", { name: /collapse appointments summary/i });
		fireEvent.click(toggleButton);
		expect(mockOnToggleExpand).toHaveBeenCalled();
	});

	test("maintains accessibility attributes", () => {
		render(
			<AppointmentsSummary
				appointments={mockAppointments}
				onUnschedule={mockOnUnschedule}
				isExpanded={true}
				onToggleExpand={mockOnToggleExpand}
			/>
		);

		const region = screen.getByRole("region");
		expect(region).toHaveAttribute("aria-label", "My Appointments");

		const list = screen.getByRole("list");
		expect(list).toHaveAttribute("aria-label", "Appointments list");

		const toggleButton = screen.getByRole("button", { name: /collapse appointments summary/i });
		expect(toggleButton).toHaveAttribute("aria-expanded", "true");
		expect(toggleButton).toHaveAttribute("aria-label", expect.stringContaining("Collapse appointments summary"));
	});

	test("supports keyboard navigation", () => {
		render(
			<AppointmentsSummary
				appointments={mockAppointments}
				onUnschedule={mockOnUnschedule}
				isExpanded={true}
				onToggleExpand={mockOnToggleExpand}
			/>
		);

		// Get appointments by their aria-labels
		const firstAppointment = screen.getByRole("listitem", {
			name: /Appointment with Dr\. Smith, Cardiology, scheduled for 10:00 AM/i,
		});
		const secondAppointment = screen.getByRole("listitem", {
			name: /Appointment with Dr\. Johnson, Dermatology, scheduled for 2:30 PM/i,
		});

		// Test appointment navigation with arrow keys
		fireEvent.keyDown(firstAppointment, { key: "ArrowDown", code: "ArrowDown" });
		expect(secondAppointment).toHaveFocus();

		// Test unscheduling with Delete key
		fireEvent.keyDown(secondAppointment, { key: "Delete", code: "Delete" });
		expect(screen.getByText("Unschedule Appointment")).toBeInTheDocument();

		// Test navigation back up with ArrowUp
		fireEvent.keyDown(secondAppointment, { key: "ArrowUp", code: "ArrowUp" });
		expect(firstAppointment).toHaveFocus();

		// Test Home key navigation
		fireEvent.keyDown(secondAppointment, { key: "Home", code: "Home" });
		expect(firstAppointment).toHaveFocus();

		// Test End key navigation
		fireEvent.keyDown(firstAppointment, { key: "End", code: "End" });
		expect(secondAppointment).toHaveFocus();
	});

	test("handles mobile view state", () => {
		// Set mobile viewport
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			configurable: true,
			value: 768,
		});

		const { rerender } = render(
			<AppointmentsSummary
				appointments={mockAppointments}
				onUnschedule={mockOnUnschedule}
				isExpanded={false}
				onToggleExpand={mockOnToggleExpand}
			/>
		);

		// Test collapsed state on mobile
		const unscheduleButtons = screen.getAllByText("Unschedule");
		unscheduleButtons.forEach((button) => {
			expect(button).toBeDisabled();
		});

		// Test expanded state on mobile
		rerender(
			<AppointmentsSummary
				appointments={mockAppointments}
				onUnschedule={mockOnUnschedule}
				isExpanded={true}
				onToggleExpand={mockOnToggleExpand}
			/>
		);

		const unscheduleButtonsExpanded = screen.getAllByText("Unschedule");
		unscheduleButtonsExpanded.forEach((button) => {
			expect(button).not.toBeDisabled();
		});
	});

	test("handles window resize", () => {
		const { rerender } = render(
			<AppointmentsSummary
				appointments={mockAppointments}
				onUnschedule={mockOnUnschedule}
				isExpanded={true}
				onToggleExpand={mockOnToggleExpand}
			/>
		);

		// Simulate window resize to mobile
		act(() => {
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: 768,
			});
			window.dispatchEvent(new Event("resize"));
		});

		rerender(
			<AppointmentsSummary
				appointments={mockAppointments}
				onUnschedule={mockOnUnschedule}
				isExpanded={false}
				onToggleExpand={mockOnToggleExpand}
			/>
		);

		const unscheduleButtons = screen.getAllByText("Unschedule");
		unscheduleButtons.forEach((button) => {
			expect(button).toBeDisabled();
		});

		// Simulate window resize back to desktop
		act(() => {
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: 1024,
			});
			window.dispatchEvent(new Event("resize"));
		});

		rerender(
			<AppointmentsSummary
				appointments={mockAppointments}
				onUnschedule={mockOnUnschedule}
				isExpanded={true}
				onToggleExpand={mockOnToggleExpand}
			/>
		);

		const unscheduleButtonsDesktop = screen.getAllByText("Unschedule");
		unscheduleButtonsDesktop.forEach((button) => {
			expect(button).not.toBeDisabled();
		});
	});
});
