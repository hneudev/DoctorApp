import React from "react";

const ImagePreloader = ({ doctors }) => {
	// Only preload the first 6 images (2 rows in desktop view)
	const imagesToPreload = doctors.slice(0, 6);

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
					href={doctor.photo}
					crossOrigin='anonymous'
				/>
			))}
		</div>
	);
};

export default ImagePreloader;
