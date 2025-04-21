import React, { useEffect } from "react";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
	useEffect(() => {
		// Auto-close the toast after the specified duration
		const timer = setTimeout(() => {
			onClose();
		}, duration);

		return () => clearTimeout(timer);
	}, [duration, onClose]);

	// Determine background color based on type
	const getBgColor = () => {
		switch (type) {
			case "success":
				return "bg-green-500";
			case "error":
				return "bg-red-500";
			case "warning":
				return "bg-yellow-500";
			case "info":
				return "bg-blue-500";
			default:
				return "bg-gray-500";
		}
	};

	// Determine icon based on type
	const getIcon = () => {
		switch (type) {
			case "success":
				return (
					<svg
						className='w-5 h-5'
						fill='currentColor'
						viewBox='0 0 20 20'>
						<path
							fillRule='evenodd'
							d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
							clipRule='evenodd'
						/>
					</svg>
				);
			case "error":
				return (
					<svg
						className='w-5 h-5'
						fill='currentColor'
						viewBox='0 0 20 20'>
						<path
							fillRule='evenodd'
							d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
							clipRule='evenodd'
						/>
					</svg>
				);
			case "warning":
				return (
					<svg
						className='w-5 h-5'
						fill='currentColor'
						viewBox='0 0 20 20'>
						<path
							fillRule='evenodd'
							d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
							clipRule='evenodd'
						/>
					</svg>
				);
			case "info":
				return (
					<svg
						className='w-5 h-5'
						fill='currentColor'
						viewBox='0 0 20 20'>
						<path
							fillRule='evenodd'
							d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
							clipRule='evenodd'
						/>
					</svg>
				);
			default:
				return null;
		}
	};

	return (
		<div
			className={`fixed bottom-4 right-4 flex items-center p-4 rounded-lg shadow-lg text-white ${getBgColor()} animate-fade-in z-50`}
			role='alert'
			aria-live='assertive'>
			<div className='flex-shrink-0 mr-3'>{getIcon()}</div>
			<div className='flex-1 mr-2'>{message}</div>
			<button
				onClick={onClose}
				className='text-gray-400 hover:text-gray-500 focus:outline-none 
							 focus:ring-2 focus:ring-blue-500 rounded-full p-1'
				aria-label={`Close ${type} notification: ${message}`}>
				<svg
					className='h-5 w-5'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
					aria-hidden='true'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M6 18L18 6M6 6l12 12'
					/>
				</svg>
			</button>
		</div>
	);
};

export default Toast;
