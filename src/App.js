import React, { useState, useRef, useEffect, lazy, Suspense } from "react";
import DoctorDirectory from "./components/DoctorDirectory";
import AppointmentsSummary from "./components/AppointmentsSummary";
import { preloadImage } from "./utils/imageOptimizer";
import { preloadFonts, addFontDisplaySwap } from "./utils/fontOptimizer";
import { mockDoctors } from "./data/mockData";

// Lazy load modal components with better chunk names
const BookingModal = lazy(() => import(/* webpackChunkName: "booking-modal" */ "./components/BookingModal"));
const Toast = lazy(() => import(/* webpackChunkName: "toast" */ "./components/Toast"));

// Loading fallback component
const LoadingFallback = () => (
	<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
		<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
	</div>
);

// Pre-render the header text to avoid layout shifts
const AppHeader = React.memo(() => (
	<header className='bg-white shadow lg:relative lg:z-0 sticky top-0 z-20'>
		<div className='max-w-7xl mx-auto py-4 lg:py-6 px-4 sm:px-6 lg:px-8'>
			<h1
				className='text-2xl lg:text-3xl font-bold text-gray-900'
				style={{
					fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
					textRendering: "optimizeLegibility",
				}}>
				Doctor Appointment Booking
			</h1>
		</div>
	</header>
));

AppHeader.displayName = "AppHeader";

function App() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [doctorToBook, setDoctorToBook] = useState(null);
	const [bookedAppointments, setBookedAppointments] = useState([]);
	const [toast, setToast] = useState(null);
	const [isAppointmentsExpanded, setIsAppointmentsExpanded] = useState(true);
	const [hasUserInteracted, setHasUserInteracted] = useState(false);
	const doctorsSectionRef = useRef(null);
	const lastScrollY = useRef(0);

	// Preload fonts and critical resources
	useEffect(() => {
		// Preload fonts
		preloadFonts();
		addFontDisplaySwap();

		// Preload critical images
		const firstThreeDoctors = mockDoctors.slice(0, 3);
		firstThreeDoctors.forEach((doctor) => {
			preloadImage(doctor.photo);
		});
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			if (window.innerWidth < 1024 && !hasUserInteracted) {
				// Only auto-collapse if user hasn't manually toggled
				const doctorsSection = doctorsSectionRef.current;
				if (doctorsSection) {
					const rect = doctorsSection.getBoundingClientRect();
					const currentScrollY = window.scrollY;

					// Collapse when scrolling down and doctors section is near the top
					if (currentScrollY > lastScrollY.current && rect.top < 100) {
						setIsAppointmentsExpanded(false);
					}
					// Expand when scrolling up and doctors section is not near the top
					else if (currentScrollY < lastScrollY.current && rect.top > 100) {
						setIsAppointmentsExpanded(true);
					}

					lastScrollY.current = currentScrollY;
				}
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [hasUserInteracted]);

	const handleToggleAppointments = () => {
		setHasUserInteracted(true);
		setIsAppointmentsExpanded(!isAppointmentsExpanded);
	};

	const handleInitiateBooking = (doctor) => {
		setDoctorToBook(doctor);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setDoctorToBook(null);
	};

	const showToast = (message, type = "success") => {
		setToast({ message, type });
	};

	const handleConfirmBooking = (doctor, timeSlot) => {
		try {
			// Check if the time slot is already booked
			const isTimeSlotBooked = bookedAppointments.some(
				(appointment) => appointment.date === timeSlot.date && appointment.time === timeSlot.time
			);

			if (isTimeSlotBooked) {
				showToast("This time slot is already booked. Please choose another time.", "error");
				return;
			}

			const newAppointment = {
				id: Date.now(),
				doctor,
				date: timeSlot.date,
				time: timeSlot.time,
				timeSlot: timeSlot.label, // Keep this for backward compatibility
			};

			setBookedAppointments((prev) => [...prev, newAppointment]);
			showToast(`Appointment booked successfully with ${doctor.name} on ${timeSlot.label}`);
			handleCloseModal();
		} catch (error) {
			showToast("Failed to book appointment. Please try again.", "error");
		}
	};

	const handleUnscheduleAppointment = (appointmentId) => {
		try {
			const appointmentToRemove = bookedAppointments.find((appointment) => appointment.id === appointmentId);

			if (appointmentToRemove) {
				setBookedAppointments((prev) => prev.filter((app) => app.id !== appointmentId));
				showToast(`Appointment with ${appointmentToRemove.doctor.name} has been unscheduled`, "info");
			}
		} catch (error) {
			showToast("Failed to unschedule appointment. Please try again.", "error");
		}
	};

	return (
		<div className='min-h-screen bg-gray-100'>
			<AppHeader />

			<main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
				<div className='px-4 py-6 sm:px-0'>
					{/* Mobile and Tablet Layout */}
					<div className='lg:hidden'>
						<div className='sticky top-[72px] z-10 bg-gray-100 pb-4'>
							<AppointmentsSummary
								appointments={bookedAppointments}
								onUnschedule={handleUnscheduleAppointment}
								isExpanded={isAppointmentsExpanded}
								onToggleExpand={handleToggleAppointments}
							/>
						</div>
						<div
							ref={doctorsSectionRef}
							className='mt-6'>
							<DoctorDirectory onInitiateBooking={handleInitiateBooking} />
						</div>
					</div>

					{/* Desktop Layout */}
					<div className='hidden lg:grid lg:grid-cols-3 lg:gap-6'>
						<div className='lg:col-span-2'>
							<DoctorDirectory onInitiateBooking={handleInitiateBooking} />
						</div>
						<div>
							<AppointmentsSummary
								appointments={bookedAppointments}
								onUnschedule={handleUnscheduleAppointment}
								isExpanded={true}
							/>
						</div>
					</div>
				</div>
			</main>

			<Suspense fallback={<LoadingFallback />}>
				{isModalOpen && (
					<BookingModal
						isOpen={isModalOpen}
						onClose={handleCloseModal}
						onConfirm={handleConfirmBooking}
						doctor={doctorToBook}
						bookedAppointments={bookedAppointments}
					/>
				)}

				{toast && (
					<Toast
						message={toast.message}
						type={toast.type}
						onClose={() => setToast(null)}
					/>
				)}
			</Suspense>
		</div>
	);
}

export default App;
