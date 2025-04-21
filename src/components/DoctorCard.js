import React, { useState, useEffect, useRef, memo } from "react";

const DoctorCard = memo(({ doctor, onBookClick, isPriority = false }) => {
	const { name, photo, specialty, availability, location } = doctor;
	const [imageError, setImageError] = useState(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const bookButtonRef = useRef(null);
	const imageRef = useRef(null);

	// Default placeholder image URL
	const placeholderImage = "https://avatar.iran.liara.run/username?username=No+Image";

	// Optimize image loading
	useEffect(() => {
		let isMounted = true;

		if (imageRef.current) {
			if (imageRef.current.complete) {
				setImageLoaded(true);
			} else {
				const img = new Image();
				img.src = photo;
				img.onload = () => {
					if (isMounted) {
						setImageLoaded(true);
					}
				};
				img.onerror = () => {
					if (isMounted) {
						setImageError(true);
						setImageLoaded(true);
					}
				};
			}
		}

		return () => {
			isMounted = false;
		};
	}, [photo]);

	const handleKeyDown = (e) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			bookButtonRef.current?.click();
		}
	};

	return (
		<article
			className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow 
				flex flex-col h-full relative ${isFocused ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
			role='article'
			aria-labelledby={`doctor-name-${doctor.id}`}
			aria-describedby={`doctor-details-${doctor.id}`}
			onFocus={() => setIsFocused(true)}
			onBlur={() => setIsFocused(false)}
			onKeyDown={handleKeyDown}
			tabIndex={0}>
			<div
				className='relative w-full pb-[100%] mb-6 rounded-lg overflow-hidden bg-gray-100'
				role='img'
				aria-label={`Profile photo of ${name}`}>
				{!imageLoaded && (
					<div
						className='absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200'
						role='progressbar'
						aria-label="Loading doctor's photo"
						aria-busy='true'
					/>
				)}
				{imageLoaded && !imageError ? (
					<img
						src={photo}
						alt={`Profile photo of ${name}`}
						className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
							imageLoaded ? "opacity-100" : "opacity-0"
						}`}
						loading={isPriority ? "eager" : "lazy"}
						fetchpriority={isPriority ? "high" : "auto"}
						decoding={isPriority ? "sync" : "async"}
						ref={imageRef}
					/>
				) : (
					<img
						src={placeholderImage}
						alt={`Placeholder profile photo for ${name}`}
						className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
							imageLoaded ? "opacity-100" : "opacity-0"
						}`}
						loading={isPriority ? "eager" : "lazy"}
						fetchpriority={isPriority ? "high" : "auto"}
						decoding={isPriority ? "sync" : "async"}
						ref={imageRef}
					/>
				)}
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
					className='space-y-4 flex-grow'>
					<div className='bg-blue-50 p-3 rounded-md'>
						<p
							className='text-blue-700 font-medium'
							role='text'
							aria-label={`Specialty: ${specialty}`}>
							{specialty}
						</p>
					</div>

					<div className='space-y-3'>
						<div className='flex items-start'>
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
							<p
								className='text-gray-600'
								role='text'
								aria-label={`Available ${availability}`}>
								<span className='font-medium'>Available:</span> {availability}
							</p>
						</div>

						<div className='flex items-start'>
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
				onClick={() => onBookClick(doctor)}
				className='mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-md 
					hover:bg-blue-700 focus:outline-none focus:ring-2 
					focus:ring-blue-500 focus:ring-offset-2 transition-colors
					disabled:bg-gray-400 disabled:cursor-not-allowed'
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

DoctorCard.displayName = "DoctorCard";
export default DoctorCard;
