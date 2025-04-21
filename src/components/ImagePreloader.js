import React, { useEffect } from "react";
import { getOptimizedImageUrl, preloadImage } from "../utils/imageOptimizer";

const ImagePreloader = ({ doctors }) => {
	// Only preload the first 6 images (2 rows in desktop view)
	const imagesToPreload = doctors.slice(0, 6);

	useEffect(() => {
		// Preload optimized images
		imagesToPreload.forEach((doctor) => {
			const optimizedUrl = getOptimizedImageUrl(doctor.photo, 400);
			preloadImage(optimizedUrl);
		});
	}, [imagesToPreload]);

	return (
		<div
			style={{ display: "none" }}
			aria-hidden='true'>
			{/* Preload links for the first few doctor images */}
			{imagesToPreload.map((doctor) => (
				<link
					key={doctor.id}
					rel='preload'
					as='image'
					href={getOptimizedImageUrl(doctor.photo, 400)}
					crossOrigin='anonymous'
				/>
			))}
		</div>
	);
};

export default ImagePreloader;
