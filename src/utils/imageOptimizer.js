// Image optimization utility
export const getOptimizedImageUrl = (originalUrl, width = 400) => {
	// If the URL is from a CDN that supports image optimization, use it
	if (originalUrl.includes("cloudinary.com")) {
		return originalUrl.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`);
	}

	// For other image sources, return the original URL
	// In a production environment, you would want to implement proper image optimization
	return originalUrl;
};

// Generate srcset for responsive images
export const generateSrcSet = (originalUrl) => {
	const widths = [200, 400, 600, 800];
	return widths.map((width) => `${getOptimizedImageUrl(originalUrl, width)} ${width}w`).join(", ");
};

// Preload critical images
export const preloadImage = (url) => {
	const link = document.createElement("link");
	link.rel = "preload";
	link.as = "image";
	link.href = url;
	document.head.appendChild(link);
};
