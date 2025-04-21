// Font optimization utility
export const preloadFonts = () => {
	// We'll use system fonts instead of loading custom fonts
	// This avoids CORS issues and missing font files
};

// Add font-display swap to ensure text is visible while fonts are loading
export const addFontDisplaySwap = () => {
	const style = document.createElement("style");
	style.textContent = `
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
  `;
	document.head.appendChild(style);
};
