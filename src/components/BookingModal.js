import React, { useState, useEffect, useRef } from "react";
import { getMockTimeSlots } from "../data/mockData";

const BookingModal = ({ isOpen, onClose, onConfirm, doctor, bookedAppointments }) => {
	const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
	const [selectedDate, setSelectedDate] = useState("");
	const [availabilityMessage, setAvailabilityMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const modalRef = useRef(null);
	const timeSlotsRef = useRef(null);
	const timeSlots = getMockTimeSlots(doctor?.id);

	// Reset states when modal opens or closes
	useEffect(() => {
		if (!isOpen) {
			setSelectedTimeSlot(null);
			setSelectedDate("");
			setAvailabilityMessage("");
			setErrorMessage("");
		} else {
			// Set initial date to today when modal opens
			const today = new Date().toISOString().split("T")[0];
			setSelectedDate(today);
			// Focus the modal when it opens
			modalRef.current?.focus();
		}
	}, [isOpen]);

	// Group time slots by date
	const groupedTimeSlots = timeSlots.reduce((groups, slot) => {
		const date = slot.date;
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(slot);
		return groups;
	}, {});

	// Get available dates for the date picker
	const availableDates = Object.keys(groupedTimeSlots).sort();

	// Check if a time slot is already booked
	const isTimeSlotBooked = (timeSlot) => {
		return bookedAppointments.some(
			(appointment) => appointment.date === timeSlot.date && appointment.time === timeSlot.time
		);
	};

	// Handle escape key press
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === "Escape") onClose();
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			return () => document.removeEventListener("keydown", handleEscape);
		}
	}, [isOpen, onClose]);

	// Handle click outside modal
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (modalRef.current && !modalRef.current.contains(e.target)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen, onClose]);

	// Handle keyboard navigation for time slots
	const handleKeyDown = (e, slot) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			if (!isTimeSlotBooked(slot)) {
				setSelectedTimeSlot(slot);
			}
		}
	};

	const handleConfirm = () => {
		try {
			if (!selectedTimeSlot) {
				setErrorMessage("Please select a time slot before confirming.");
				return;
			}
			onConfirm(doctor, selectedTimeSlot);
			setSelectedTimeSlot(null);
			setErrorMessage("");
		} catch (error) {
			setErrorMessage("An error occurred while booking the appointment. Please try again.");
		}
	};

	const handleDateChange = (e) => {
		const newDate = e.target.value;
		setSelectedDate(newDate);
		setSelectedTimeSlot(null);
		setErrorMessage("");

		// Update availability message for screen readers
		const formattedDate = new Date(newDate).toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
		});

		if (groupedTimeSlots[newDate]) {
			const availableSlots = groupedTimeSlots[newDate].filter((slot) => !isTimeSlotBooked(slot)).length;
			setAvailabilityMessage(
				`${formattedDate} has ${availableSlots} available time slots. ${
					availableSlots === 0 ? "All slots are booked." : "Please select a time slot."
				}`
			);
		} else {
			setAvailabilityMessage(`${formattedDate} has no available time slots.`);
		}
	};

	const handlePrevDay = () => {
		const currentIndex = availableDates.indexOf(selectedDate);
		if (currentIndex > 0) {
			const newDate = availableDates[currentIndex - 1];
			setSelectedDate(newDate);
			setSelectedTimeSlot(null);
			setErrorMessage("");
			handleDateChange({ target: { value: newDate } });
		}
	};

	const handleNextDay = () => {
		const currentIndex = availableDates.indexOf(selectedDate);
		if (currentIndex < availableDates.length - 1) {
			const newDate = availableDates[currentIndex + 1];
			setSelectedDate(newDate);
			setSelectedTimeSlot(null);
			setErrorMessage("");
			handleDateChange({ target: { value: newDate } });
		}
	};

	const isPrevDayDisabled = availableDates.indexOf(selectedDate) === 0;
	const isNextDayDisabled = availableDates.indexOf(selectedDate) === availableDates.length - 1;

	if (!isOpen || !doctor) return null;

	return (
		<div
			className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'
			role='dialog'
			aria-modal='true'
			aria-labelledby='modal-title'
			aria-describedby='modal-description'>
			<div
				ref={modalRef}
				className='bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto'
				tabIndex={-1}>
				{/* Skip link for keyboard users */}
				<a
					href='#time-slots'
					className='sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 
                             focus:z-50 focus:p-4 focus:bg-white focus:text-blue-600'>
					Skip to time slots
				</a>

				{/* Header */}
				<div className='p-4 border-b border-gray-200'>
					<div className='flex items-center justify-between'>
						<h2
							id='modal-title'
							className='text-xl font-semibold text-gray-900'>
							Book Appointment with {doctor.name}
						</h2>
						<button
							onClick={onClose}
							className='text-gray-400 hover:text-gray-500 focus:outline-none 
                             focus:ring-2 focus:ring-blue-500 rounded-full p-1'
							aria-label={`Close booking modal for appointment with ${doctor.name}`}>
							<svg
								className='h-6 w-6'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
								aria-hidden='true'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						</button>
					</div>
					<p
						id='modal-description'
						className='sr-only'>
						Select a date and time slot to book an appointment with {doctor.name}. Use the date picker to choose a date,
						then select an available time slot.
					</p>
				</div>

				{/* Body */}
				<div className='p-4'>
					<div className='mb-6'>
						<label
							htmlFor='date-picker'
							className='block text-sm font-medium text-gray-700 mb-2'>
							Select Date
						</label>
						<div className='flex items-center space-x-2'>
							<button
								onClick={handlePrevDay}
								disabled={isPrevDayDisabled}
								className='p-2 rounded-md text-gray-600 hover:bg-gray-100 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             disabled:opacity-50 disabled:cursor-not-allowed'
								aria-label='Previous day'
								aria-disabled={isPrevDayDisabled}>
								<svg
									className='h-5 w-5'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
									aria-hidden='true'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M15 19l-7-7 7-7'
									/>
								</svg>
							</button>
							<div className='relative flex-grow'>
								<input
									type='date'
									id='date-picker'
									value={selectedDate}
									onChange={handleDateChange}
									min={availableDates[0]}
									max={availableDates[availableDates.length - 1]}
									className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm 
                             focus:outline-none focus:ring-blue-500 focus:border-blue-500'
									aria-describedby='date-availability'
									aria-label='Select appointment date'
								/>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<svg
										className='h-5 w-5 text-gray-400'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
										aria-hidden='true'>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
										/>
									</svg>
								</div>
							</div>
							<button
								onClick={handleNextDay}
								disabled={isNextDayDisabled}
								className='p-2 rounded-md text-gray-600 hover:bg-gray-100 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             disabled:opacity-50 disabled:cursor-not-allowed'
								aria-label='Next day'
								aria-disabled={isNextDayDisabled}>
								<svg
									className='h-5 w-5'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
									aria-hidden='true'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M9 5l7 7-7 7'
									/>
								</svg>
							</button>
						</div>
						{/* ARIA live region for date availability */}
						<div
							id='date-availability'
							className='sr-only'
							aria-live='polite'
							role='status'>
							{availabilityMessage}
						</div>
						{/* ARIA live region for errors */}
						<div
							id='error-message'
							className='sr-only'
							aria-live='assertive'
							role='alert'>
							{errorMessage}
						</div>
					</div>

					<h3 className='text-lg font-medium text-gray-900 mb-4'>Available Time Slots:</h3>

					<div className='space-y-6'>
						{selectedDate && groupedTimeSlots[selectedDate] ? (
							<div className='space-y-2'>
								<h4 className='font-medium text-gray-700'>
									{new Date(selectedDate).toLocaleDateString("en-US", {
										weekday: "long",
										month: "long",
										day: "numeric",
									})}
								</h4>
								<div
									id='time-slots'
									ref={timeSlotsRef}
									className='grid grid-cols-2 sm:grid-cols-3 gap-2'
									role='group'
									aria-label='Available time slots'>
									{groupedTimeSlots[selectedDate].map((slot) => {
										const isBooked = isTimeSlotBooked(slot);
										return (
											<button
												key={slot.id}
												onClick={() => !isBooked && setSelectedTimeSlot(slot)}
												onKeyDown={(e) => handleKeyDown(e, slot)}
												disabled={isBooked}
												className={`p-2 rounded-md text-sm font-medium transition-colors
                          ${
														selectedTimeSlot?.id === slot.id
															? "bg-blue-600 text-white"
															: isBooked
															? "bg-red-100 text-red-600 cursor-not-allowed"
															: "bg-gray-100 text-gray-700 hover:bg-gray-200"
													} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
												aria-pressed={selectedTimeSlot?.id === slot.id}
												aria-label={`${slot.time}${isBooked ? ", Booked" : ""}`}
												aria-disabled={isBooked}>
												{slot.time}
											</button>
										);
									})}
								</div>
							</div>
						) : (
							<div className='text-center py-4'>
								<svg
									className='mx-auto h-12 w-12 text-gray-400'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
									aria-hidden='true'>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
									/>
								</svg>
								<p className='mt-2 text-sm text-gray-500'>No available slots for this date</p>
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className='p-4 border-t border-gray-200'>
					<div className='flex justify-end space-x-3'>
						<button
							onClick={onClose}
							className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 
                       rounded-md hover:bg-gray-200 focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'>
							Cancel
						</button>
						<button
							onClick={handleConfirm}
							disabled={!selectedTimeSlot}
							className='px-4 py-2 text-sm font-medium text-white bg-blue-600 
                       rounded-md hover:bg-blue-700 focus:outline-none 
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                       disabled:bg-gray-400 disabled:cursor-not-allowed'
							aria-disabled={!selectedTimeSlot}>
							Confirm Appointment
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BookingModal;
