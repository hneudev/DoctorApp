import React, { useEffect, useRef } from "react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
	const modalRef = useRef(null);

	// Handle escape key press
	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === "Escape") onClose();
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			return () => document.removeEventListener("keydown", handleEscape);
		}
	}, [isOpen, onClose]);

	// Handle click outside modal
	useEffect(() => {
		const handleClickOutside = (e) => {
			if (modalRef.current && !modalRef.current.contains(e.target)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'
			role='dialog'
			aria-modal='true'
			aria-labelledby='confirmation-title'>
			<div
				ref={modalRef}
				className='bg-white rounded-lg max-w-md w-full p-6 animate-fade-in'>
				<h2
					id='confirmation-title'
					className='text-xl font-semibold text-gray-900 mb-4'>
					{title}
				</h2>

				<p className='text-gray-600 mb-6'>{message}</p>

				<div className='flex justify-end space-x-3'>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-gray-500 focus:outline-none 
                     focus:ring-2 focus:ring-blue-500 rounded-full p-1'
						aria-label={`Close ${title.toLowerCase()} confirmation modal`}>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
							strokeWidth={1.5}
							stroke='currentColor'
							className='w-6 h-6'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
					<button
						onClick={onConfirm}
						className='px-4 py-2 text-sm font-medium text-white bg-red-600 
                     rounded-md hover:bg-red-700 focus:outline-none 
                     focus:ring-2 focus:ring-red-500 focus:ring-offset-2'>
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;
