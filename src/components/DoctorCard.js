import React, { useState, useEffect, useRef, memo, useMemo, useCallback } from "react";
import { getOptimizedImageUrl, generateSrcSet } from "../utils/imageOptimizer";

// Memoized SVG components
const ClockIcon = memo(() => (
	<svg
		className='h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0'
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
));

const LocationIcon = memo(() => (
	<svg
		className='h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0'
		fill='none'
		viewBox='0 0 24 24'
		stroke='currentColor'
		aria-hidden='true'>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
		/>
		<path
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={2}
			d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
		/>
	</svg>
));

ClockIcon.displayName = "ClockIcon";
LocationIcon.displayName = "LocationIcon";

// Memoized placeholder image URL
const PLACEHOLDER_IMAGE =
	"https://avatar.iran.liara.run/username" +
	"?username=No+Image" +
	"&size=128" + // Minimum size allowed
	"&format=png" + // PNG for better quality/size ratio
	"&bold=false" + // Disable bold to reduce file size
	"&length=1" + // Single character for initials
	"&uppercase=true" + // Keep uppercase for better visibility
	"&background=eeeeee" + // Light gray background
	"&color=666666"; // Darker gray text for contrast

const DoctorCard = memo(({ doctor, onBookClick, isPriority = false, ...props }) => {
	const { name, photo, specialty, availability, location } = doctor;
	const [imageError, setImageError] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const bookButtonRef = useRef(null);
	const imageRef = useRef(null);

	// Memoize event handlers
	const handleFocus = useCallback(() => setIsFocused(true), []);
	const handleBlur = useCallback(() => setIsFocused(false), []);
	const handleBookClick = useCallback(() => onBookClick(doctor), [onBookClick, doctor]);

	const handleKeyDown = useCallback((e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			bookButtonRef.current?.click();
		}
	}, []);

	// Optimize image loading
	useEffect(() => {
		if (!imageRef.current || !photo) return;

		// Set loading state based on browser cache
		setImageLoaded(imageRef.current.complete);

		const handleLoad = () => setImageLoaded(true);
		const handleError = () => {
			setImageError(true);
			setImageLoaded(true);
		};

		imageRef.current.addEventListener("load", handleLoad);
		imageRef.current.addEventListener("error", handleError);

		return () => {
			if (imageRef.current) {
				imageRef.current.removeEventListener("load", handleLoad);
				imageRef.current.removeEventListener("error", handleError);
			}
		};
	}, [photo]);

	// Memoize class names
	const containerClassName = useMemo(
		() =>
			`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow 
		flex flex-col h-full relative ${isFocused ? "ring-2 ring-blue-500 ring-offset-2" : ""} ${props.className || ""}`,
		[isFocused, props.className]
	);

	const placeholderClassName = useMemo(
		() =>
			`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 ${
				!imageLoaded || imageError ? "opacity-100" : "opacity-0"
			}`,
		[imageLoaded, imageError]
	);

	const mainImageClassName = useMemo(
		() =>
			`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-300 will-change-opacity ${
				imageLoaded && !imageError ? "opacity-100" : "opacity-0"
			}`,
		[imageLoaded, imageError]
	);

	return (
		<article
			{...props}
			className={containerClassName}
			role='article'
			aria-labelledby={`doctor-name-${doctor.id}`}
			aria-describedby={`doctor-details-${doctor.id}`}
			onFocus={handleFocus}
			onBlur={handleBlur}
			onKeyDown={handleKeyDown}
			tabIndex={0}>
			<div
				className='relative w-full pb-[100%] mb-6 rounded-lg overflow-hidden bg-gray-100'
				role='img'
				aria-label={`Profile photo of ${name}`}>
				{/* Show placeholder immediately while main image loads */}
				<img
					src={PLACEHOLDER_IMAGE}
					alt=''
					className={placeholderClassName}
					loading='eager'
					decoding='sync'
				/>

				{/* Main image */}
				<img
					ref={imageRef}
					src={getOptimizedImageUrl(photo, 200)}
					srcSet={generateSrcSet(photo)}
					sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
					alt={`${name} - ${specialty}`}
					className={mainImageClassName}
					loading={isPriority ? "eager" : "lazy"}
					fetchpriority={isPriority ? "high" : "auto"}
					decoding='async'
				/>
			</div>

			<div className='flex-grow flex flex-col min-h-[180px]'>
				<div className='mb-4 min-h-[3.5rem]'>
					<h3
						id={`doctor-name-${doctor.id}`}
						className='text-xl font-semibold text-gray-900 line-clamp-2'>
						{name}
					</h3>
				</div>

				<div
					id={`doctor-details-${doctor.id}`}
					className='flex-grow space-y-4'>
					<div className='p-3 rounded-md bg-blue-50'>
						<p
							className='font-medium text-blue-700'
							role='text'
							aria-label={`Specialty: ${specialty}`}>
							{specialty}
						</p>
					</div>

					<div className='space-y-3'>
						<div className='flex items-start'>
							<ClockIcon />
							<p
								className='text-gray-600'
								role='text'
								aria-label={`Available ${availability}`}>
								<span className='font-medium'>Available:</span> {availability}
							</p>
						</div>

						<div className='flex items-start'>
							<LocationIcon />
							<p
								className='text-gray-600'
								role='text'
								aria-label={`Located at ${location}`}>
								<span className='font-medium'>Location:</span> {location}
							</p>
						</div>
					</div>
				</div>
			</div>

			<button
				ref={bookButtonRef}
				onClick={handleBookClick}
				className='w-full px-4 py-3 mt-6 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed'
				aria-label={`Book appointment with ${name}, ${specialty}, available ${availability}, located at ${location}`}>
				Book Appointment
			</button>

			{/* Screen reader instructions */}
			<div
				className='sr-only'
				role='note'>
				Press Enter or Space to book an appointment with this doctor.
			</div>
		</article>
	);
});

// Add display name for debugging
DoctorCard.displayName = "DoctorCard";

export default DoctorCard;
