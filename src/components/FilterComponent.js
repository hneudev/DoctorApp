import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";

const FilterComponent = memo(({ specialties, currentFilter, onFilterChange, id }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);
	const dropdownRef = useRef(null);
	const optionsRef = useRef([]);

	// Create unique IDs for ARIA elements
	const labelId = `${id}-label`;
	const listboxId = `${id}-listbox`;

	// Reset refs array when specialties change
	useEffect(() => {
		optionsRef.current = optionsRef.current.slice(0, specialties.length + 1); // +1 for "All Specialties"
	}, [specialties]);

	// Memoize specialty toggle handler
	const handleSpecialtyToggle = useCallback(
		(specialty) => {
			let newFilter;
			if (specialty === "") {
				// Clicking "All Specialties"
				newFilter = [""];
			} else if (currentFilter.includes("")) {
				// Moving from "All" to specific specialty
				newFilter = [specialty];
			} else if (currentFilter.includes(specialty)) {
				// Removing a specialty
				newFilter = currentFilter.filter((s) => s !== specialty);
				// If no specialties selected, default to "All"
				if (newFilter.length === 0) newFilter = [""];
			} else {
				// Adding a specialty
				newFilter = [...currentFilter.filter((s) => s !== ""), specialty];
			}
			onFilterChange(newFilter);
		},
		[currentFilter, onFilterChange]
	);

	// Memoize keyboard navigation handler
	const handleKeyDown = useCallback(
		(e) => {
			if (!isOpen && (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")) {
				e.preventDefault();
				setIsOpen(true);
				setFocusedOptionIndex(0);
				return;
			}

			if (!isOpen) return;

			switch (e.key) {
				case "Escape":
					e.preventDefault();
					setIsOpen(false);
					setFocusedOptionIndex(-1);
					dropdownRef.current?.focus();
					break;
				case "ArrowDown":
					e.preventDefault();
					setFocusedOptionIndex((prev) => Math.min(prev + 1, specialties.length));
					break;
				case "ArrowUp":
					e.preventDefault();
					setFocusedOptionIndex((prev) => Math.max(prev - 1, 0));
					break;
				case "Home":
					e.preventDefault();
					setFocusedOptionIndex(0);
					break;
				case "End":
					e.preventDefault();
					setFocusedOptionIndex(specialties.length);
					break;
				case "Enter":
				case " ":
					e.preventDefault();
					if (focusedOptionIndex === 0) {
						handleSpecialtyToggle("");
					} else {
						handleSpecialtyToggle(specialties[focusedOptionIndex - 1]);
					}
					break;
				default:
					return;
			}
		},
		[isOpen, focusedOptionIndex, specialties, handleSpecialtyToggle]
	);

	// Focus management
	useEffect(() => {
		if (isOpen && focusedOptionIndex >= 0) {
			optionsRef.current[focusedOptionIndex]?.focus();
		}
	}, [focusedOptionIndex, isOpen]);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
				setFocusedOptionIndex(-1);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Memoize display text
	const displayText = useMemo(() => {
		if (currentFilter.includes("")) return "All Specialties";
		return `Selected: ${currentFilter.join(", ")}`;
	}, [currentFilter]);

	return (
		<div
			className='mb-6 relative'
			ref={dropdownRef}
			onKeyDown={handleKeyDown}>
			<span
				id={labelId}
				className='sr-only'>
				Filter doctors by specialty
			</span>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
				aria-haspopup='listbox'
				aria-expanded={isOpen}
				aria-labelledby={labelId}
				aria-controls={listboxId}
				aria-label={`Filter doctors by ${displayText}. Currently showing ${displayText}`}>
				<span className='block truncate text-gray-900'>{displayText}</span>
				<svg
					className={`ml-2 h-5 w-5 text-gray-900 transition-transform duration-200 ${
						isOpen ? "transform rotate-180" : ""
					}`}
					xmlns='http://www.w3.org/2000/svg'
					viewBox='0 0 20 20'
					fill='currentColor'
					aria-hidden='true'>
					<path
						fillRule='evenodd'
						d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
						clipRule='evenodd'
					/>
				</svg>
			</button>

			{isOpen && (
				<div
					className='absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg'
					id={listboxId}
					role='listbox'
					aria-labelledby={labelId}
					aria-multiselectable='true'>
					<ul
						className='max-h-60 overflow-auto py-1 text-base'
						role='presentation'>
						<li>
							<div
								ref={(el) => (optionsRef.current[0] = el)}
								onClick={() => handleSpecialtyToggle("")}
								className={`w-full text-left flex items-center px-4 py-2 hover:bg-gray-100 
									focus:outline-none focus:bg-gray-100 focus:ring-2 focus:ring-inset focus:ring-blue-500
									${focusedOptionIndex === 0 ? "bg-gray-100" : ""}`}
								role='option'
								id={`${id}-option-all`}
								aria-selected={currentFilter.includes("")}
								tabIndex={0}>
								<input
									type='checkbox'
									checked={currentFilter.includes("")}
									onChange={() => {}}
									className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
									aria-hidden='true'
								/>
								<span className='ml-3 text-gray-900'>All Specialties</span>
							</div>
						</li>
						{specialties.map((specialty, index) => (
							<li key={specialty}>
								<div
									ref={(el) => (optionsRef.current[index + 1] = el)}
									onClick={() => handleSpecialtyToggle(specialty)}
									className={`w-full text-left flex items-center px-4 py-2 hover:bg-gray-100 
										focus:outline-none focus:bg-gray-100 focus:ring-2 focus:ring-inset focus:ring-blue-500
										${focusedOptionIndex === index + 1 ? "bg-gray-100" : ""}`}
									role='option'
									id={`${id}-option-${index + 1}`}
									aria-selected={currentFilter.includes(specialty)}
									tabIndex={0}>
									<input
										type='checkbox'
										checked={currentFilter.includes(specialty)}
										onChange={() => {}}
										className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
										aria-hidden='true'
									/>
									<span className='ml-3 text-gray-900'>{specialty}</span>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Screen reader instructions */}
			<div
				className='sr-only'
				role='note'
				id={`${id}-instructions`}>
				Press Enter or Space to open the specialty filter. Use arrow keys to navigate options. Press Enter or Space to
				select or deselect a specialty.
			</div>
		</div>
	);
});

// Add prop types validation
FilterComponent.defaultProps = {
	id: "filter-" + Math.random().toString(36).substr(2, 9),
};

export default FilterComponent;
