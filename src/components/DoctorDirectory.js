import React, { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import { mockDoctors } from "../data/mockData";
import DoctorCard from "./DoctorCard";
import FilterComponent from "./FilterComponent";
import ImagePreloader from "./ImagePreloader";

const ITEMS_PER_PAGE = 9; // Show 9 doctors initially (3x3 grid)

// Generate a unique ID for ARIA purposes
const generateUniqueId = (() => {
	let counter = 0;
	return (prefix) => `${prefix}-${counter++}`;
})();

// Memoize the DoctorCard component
const MemoizedDoctorCard = memo(DoctorCard);

// Extract loading indicator to a separate component
const LoadingIndicator = memo(({ isLoading }) =>
	isLoading ? (
		<div className='animate-pulse flex space-x-2'>
			<div className='h-2 w-2 bg-blue-600 rounded-full'></div>
			<div className='h-2 w-2 bg-blue-600 rounded-full'></div>
			<div className='h-2 w-2 bg-blue-600 rounded-full'></div>
		</div>
	) : (
		<p className='text-gray-800 text-sm'>Scroll to load more</p>
	)
);

const DoctorDirectory = ({ onInitiateBooking }) => {
	const directoryId = useMemo(() => `directory-${Math.random().toString(36).substr(2, 9)}`, []);
	const [selectedSpecialties, setSelectedSpecialties] = useState([""]);
	const [focusedCardIndex, setFocusedCardIndex] = useState(-1);
	const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
	const [isLoading, setIsLoading] = useState(false);
	const cardRefs = useRef([]);
	const observerRef = useRef(null);
	const loadingRef = useRef(null);

	// Get unique specialties for filter options
	const specialties = useMemo(() => {
		return [...new Set(mockDoctors.map((doctor) => doctor.specialty))].sort();
	}, []);

	// Filter doctors based on selected specialties
	const filteredDoctors = useMemo(() => {
		if (selectedSpecialties.includes("")) return mockDoctors;
		return mockDoctors.filter((doctor) => selectedSpecialties.includes(doctor.specialty));
	}, [selectedSpecialties]);

	// Get the current slice of doctors to display
	const displayedDoctors = useMemo(() => {
		return filteredDoctors.slice(0, displayCount);
	}, [filteredDoctors, displayCount]);

	// Reset display count when filters change
	useEffect(() => {
		setDisplayCount(ITEMS_PER_PAGE);
		setFocusedCardIndex(-1);
	}, [selectedSpecialties]);

	// Reset refs array when displayed doctors change
	useEffect(() => {
		cardRefs.current = cardRefs.current.slice(0, displayedDoctors.length);
	}, [displayedDoctors]);

	// Optimize the intersection observer callback
	const handleIntersection = useCallback(
		(entries) => {
			const [entry] = entries;
			if (entry.isIntersecting && !isLoading && displayCount < filteredDoctors.length) {
				setIsLoading(true);
				// Simulate loading delay
				setTimeout(() => {
					setDisplayCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredDoctors.length));
					setIsLoading(false);
				}, 500);
			}
		},
		[isLoading, displayCount, filteredDoctors.length]
	);

	// Set up intersection observer
	useEffect(() => {
		const observer = new IntersectionObserver(handleIntersection, {
			root: null,
			rootMargin: "20px",
			threshold: 0.1,
		});

		if (loadingRef.current) {
			observer.observe(loadingRef.current);
		}

		observerRef.current = observer;

		return () => {
			if (observerRef.current) {
				observerRef.current.disconnect();
			}
		};
	}, [handleIntersection]);

	// Handle keyboard navigation
	const handleKeyDown = (e, index) => {
		let newIndex = focusedCardIndex;

		switch (e.key) {
			case "ArrowRight":
			case "ArrowDown":
				e.preventDefault();
				newIndex = Math.min(focusedCardIndex + 1, displayedDoctors.length - 1);
				break;
			case "ArrowLeft":
			case "ArrowUp":
				e.preventDefault();
				newIndex = Math.max(focusedCardIndex - 1, 0);
				break;
			case "Home":
				e.preventDefault();
				newIndex = 0;
				break;
			case "End":
				e.preventDefault();
				newIndex = displayedDoctors.length - 1;
				break;
			default:
				return;
		}

		if (newIndex !== focusedCardIndex) {
			setFocusedCardIndex(newIndex);
			cardRefs.current[newIndex]?.focus();
		}
	};

	// Handle focus events
	const handleFocus = (index) => {
		setFocusedCardIndex(index);
	};

	// Handle blur events
	const handleBlur = () => {
		// Only reset focus index if we're not moving to another card
		setTimeout(() => {
			if (!cardRefs.current.some((ref) => ref === document.activeElement)) {
				setFocusedCardIndex(-1);
			}
		}, 0);
	};

	// Memoize the grid cell render function
	const renderGridCell = useCallback(
		(doctor, index, rowIndex) => {
			const cellId = `${directoryId}-cell-${rowIndex}-${index}`;
			return (
				<div
					key={cellId}
					role='gridcell'
					tabIndex={0}
					id={cellId}
					ref={(el) => (cardRefs.current[rowIndex * 3 + index] = el)}
					className={`outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg ${
						focusedCardIndex === rowIndex * 3 + index ? "ring-2 ring-blue-500 ring-offset-2" : ""
					}`}
					onFocus={() => handleFocus(rowIndex * 3 + index)}
					onBlur={handleBlur}
					aria-label={`Doctor card ${rowIndex * 3 + index + 1} of ${displayedDoctors.length}`}>
					<MemoizedDoctorCard
						doctor={doctor}
						onBookClick={onInitiateBooking}
						isPriority={rowIndex * 3 + index < 6}
					/>
				</div>
			);
		},
		[focusedCardIndex, displayedDoctors.length, onInitiateBooking, handleFocus, handleBlur]
	);

	return (
		<section
			className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
			role='region'
			id={directoryId}
			aria-label='Doctor Directory'>
			<ImagePreloader doctors={displayedDoctors.slice(0, 6)} />

			<div className='mb-8'>
				<h2 className='text-2xl font-bold text-gray-900 mb-4'>Available Doctors</h2>

				<FilterComponent
					specialties={specialties}
					currentFilter={selectedSpecialties}
					onFilterChange={setSelectedSpecialties}
					id={`${directoryId}-filter`}
				/>
			</div>

			{filteredDoctors.length === 0 ? (
				<p
					className='text-gray-500 text-center py-8'
					role='alert'>
					No doctors found for the selected specialties.
				</p>
			) : (
				<>
					<div
						className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
						role='grid'
						aria-label='Doctors grid'
						onKeyDown={handleKeyDown}>
						{/* Group doctors into rows */}
						{Array.from({ length: Math.ceil(displayedDoctors.length / 3) }).map((_, rowIndex) => (
							<div
								key={`row-${rowIndex}`}
								role='row'
								className='contents'>
								{displayedDoctors
									.slice(rowIndex * 3, (rowIndex + 1) * 3)
									.map((doctor, index) => renderGridCell(doctor, index, rowIndex))}
							</div>
						))}
					</div>

					{/* Loading indicator and intersection observer target */}
					{displayCount < filteredDoctors.length && (
						<div
							ref={loadingRef}
							className='flex justify-center items-center py-8'
							role='status'
							aria-label='Loading more doctors'>
							<LoadingIndicator isLoading={isLoading} />
						</div>
					)}

					{/* Screen reader announcement for loaded doctors */}
					<div
						className='sr-only'
						role='status'
						aria-live='polite'>
						{`Showing ${displayedDoctors.length} of ${filteredDoctors.length} doctors`}
					</div>
				</>
			)}

			{/* Screen reader instructions */}
			<div
				className='sr-only'
				role='note'>
				Use arrow keys to navigate between doctor cards. Press Enter or Space to select a doctor and book an
				appointment. Scroll down to load more doctors.
			</div>
		</section>
	);
};

export default memo(DoctorDirectory);
