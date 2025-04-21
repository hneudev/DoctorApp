import React, { useState, useEffect, useRef } from "react";
import ConfirmationModal from "./ConfirmationModal";

const AppointmentsSummary = ({ appointments, onUnschedule, isExpanded, onToggleExpand }) => {
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const [appointmentToUnschedule, setAppointmentToUnschedule] = useState(null);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
	const [focusedAppointmentIndex, setFocusedAppointmentIndex] = useState(-1);
	const appointmentRefs = useRef([]);

	// Reset refs array when appointments change
	useEffect(() => {
		appointmentRefs.current = appointmentRefs.current.slice(0, appointments?.length || 0);
	}, [appointments]);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 1024);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleUnscheduleClick = (appointment) => {
		if (isMobile && !isExpanded) return; // Prevent unscheduling when collapsed on mobile
		setAppointmentToUnschedule(appointment);
		setIsConfirmationModalOpen(true);
	};

	const handleConfirmUnschedule = () => {
		if (appointmentToUnschedule) {
			onUnschedule(appointmentToUnschedule.id);
			setIsConfirmationModalOpen(false);
			setAppointmentToUnschedule(null);
		}
	};

	const handleCloseConfirmationModal = () => {
		setIsConfirmationModalOpen(false);
		setAppointmentToUnschedule(null);
	};

	const handleKeyDown = (e, index) => {
		if (isMobile && !isExpanded) return; // Prevent keyboard navigation when collapsed on mobile

		switch (e.key) {
			case "ArrowDown":
				e.preventDefault();
				if (index < (appointments?.length || 0) - 1) {
					setFocusedAppointmentIndex(index + 1);
					appointmentRefs.current[index + 1]?.focus();
				}
				break;
			case "ArrowUp":
				e.preventDefault();
				if (index > 0) {
					setFocusedAppointmentIndex(index - 1);
					appointmentRefs.current[index - 1]?.focus();
				}
				break;
			case "Home":
				e.preventDefault();
				if (appointments?.length) {
					setFocusedAppointmentIndex(0);
					appointmentRefs.current[0]?.focus();
				}
				break;
			case "End":
				e.preventDefault();
				if (appointments?.length) {
					setFocusedAppointmentIndex(appointments.length - 1);
					appointmentRefs.current[appointments.length - 1]?.focus();
				}
				break;
			case "Delete":
			case "Backspace":
				e.preventDefault();
				handleUnscheduleClick(appointments[index]);
				break;
			default:
				return;
		}
	};

	const handleFocus = (index) => {
		if (isMobile && !isExpanded) return; // Prevent focus when collapsed on mobile
		setFocusedAppointmentIndex(index);
	};

	const handleBlur = () => {
		// Only reset focus index if we're not moving to another appointment
		setTimeout(() => {
			if (!appointmentRefs.current.some((ref) => ref === document.activeElement)) {
				setFocusedAppointmentIndex(-1);
			}
		}, 0);
	};

	if (!appointments?.length) {
		return (
			<div
				className='bg-white rounded-lg shadow-md p-4'
				role='region'
				aria-label='My Appointments'>
				<div className='flex items-center justify-between mb-4'>
					<h2 className='text-xl font-semibold text-gray-900'>My Appointments</h2>
					{isMobile && (
						<button
							onClick={onToggleExpand}
							className='text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md'
							aria-expanded={isExpanded}
							aria-label={isExpanded ? "Collapse appointments" : "Expand appointments"}>
							<svg
								className={`w-6 h-6 transform transition-transform duration-300 ${
									isExpanded ? "rotate-180" : "rotate-0"
								}`}
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
								aria-hidden='true'>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19 9l-7 7-7-7'
								/>
							</svg>
						</button>
					)}
				</div>
				<div
					className={`transition-all duration-300 ease-in-out ${
						isMobile && !isExpanded ? "h-0 opacity-0 pointer-events-none" : "opacity-100"
					}`}>
					<p
						className='text-gray-500 text-center py-4'
						role='status'>
						No appointments scheduled
					</p>
				</div>
			</div>
		);
	}

	return (
		<div
			className='bg-white rounded-lg shadow-md p-4'
			role='region'
			aria-label='My Appointments'>
			<div className='flex items-center justify-between mb-4'>
				<button
					onClick={onToggleExpand}
					className='flex items-center justify-between w-full px-4 py-2 text-lg font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg'
					aria-expanded={isExpanded}
					aria-label={`${isExpanded ? "Collapse" : "Expand"} appointments summary. ${
						appointments.length
					} appointments scheduled.`}>
					<div className='flex items-center'>
						<h2 className='text-xl font-bold'>My Appointments</h2>
						<span className='ml-2 text-sm font-medium text-gray-600'>({appointments.length})</span>
					</div>
					<svg
						className={`h-6 w-6 transform transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
						xmlns='http://www.w3.org/2000/svg'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
						aria-hidden='true'>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M19 9l-7 7-7-7'
						/>
					</svg>
				</button>
			</div>

			<div
				className={`transition-all duration-300 ease-in-out ${
					isMobile && !isExpanded ? "h-0 opacity-0 pointer-events-none invisible" : "opacity-100"
				}`}
				aria-hidden={isMobile && !isExpanded}>
				<div
					className='space-y-4'
					role='list'
					aria-label='Appointments list'>
					{appointments.map((appointment, index) => (
						<div
							key={appointment.id}
							ref={(el) => (appointmentRefs.current[index] = el)}
							tabIndex={isMobile && !isExpanded ? -1 : 0}
							role='listitem'
							className={`border rounded-lg p-4 hover:shadow-md transition-shadow outline-none
								${focusedAppointmentIndex === index ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
							onKeyDown={(e) => handleKeyDown(e, index)}
							onFocus={() => handleFocus(index)}
							onBlur={handleBlur}>
							<div className='flex justify-between items-start'>
								<div>
									<h3 className='font-medium text-gray-900'>{appointment.doctor.name}</h3>
									<p className='text-sm text-gray-600'>{appointment.doctor.specialty}</p>
									<p className='text-sm text-gray-500 mt-1'>Time: {appointment.timeSlot}</p>
								</div>
								<button
									onClick={() => handleUnscheduleClick(appointment)}
									className='text-red-600 hover:text-red-800 text-sm font-medium 
										focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-md px-2 py-1'
									aria-label={`Unschedule appointment with ${appointment.doctor.name} at ${appointment.timeSlot}`}
									tabIndex={isMobile && !isExpanded ? -1 : 0}
									disabled={isMobile && !isExpanded}>
									Unschedule
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			<ConfirmationModal
				isOpen={isConfirmationModalOpen}
				onClose={handleCloseConfirmationModal}
				onConfirm={handleConfirmUnschedule}
				title='Unschedule Appointment'
				message={`Are you sure you want to unschedule your appointment with ${appointmentToUnschedule?.doctor.name} at ${appointmentToUnschedule?.timeSlot}?`}
			/>

			{/* Screen reader instructions */}
			<div
				className='sr-only'
				role='note'>
				Use up and down arrow keys to navigate appointments. Press Delete or Backspace to unschedule the focused
				appointment.
			</div>
		</div>
	);
};

export default AppointmentsSummary;
