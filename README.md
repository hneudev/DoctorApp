# Doctor Appointment Booking UI

A modern, accessible web application for booking doctor appointments. Built with React and styled with Tailwind CSS.

## Features

- **Doctor Directory**: Browse and search for doctors by specialty
- **Appointment Booking**: Schedule appointments with available time slots
- **Appointment Management**: View and manage your scheduled appointments
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Comprehensive accessibility features for screen readers

## Accessibility Features

- **ARIA Attributes**: Proper ARIA roles, labels, and states throughout the application
- **Keyboard Navigation**:
  - Arrow keys for navigating between appointments and doctor cards
  - Enter/Space for selecting items
  - Home/End keys for jumping to first/last items
  - Delete/Backspace for unscheduling appointments
- **Focus Management**: Proper focus handling for modals and interactive elements
- **Screen Reader Instructions**: Hidden instructions for screen reader users
- **High Contrast**: Sufficient color contrast for text and interactive elements
- **Responsive Text**: Text remains readable at all viewport sizes

## Recent Improvements

### AppointmentsSummary Component

- Added descriptive aria-labels to appointment list items
- Fixed keyboard navigation tests to properly identify elements
- Improved focus management for appointment items
- Enhanced mobile view handling with proper aria-hidden attributes

### FilterComponent

- Improved dropdown list width to match button width
- Enhanced color contrast for better readability
- Added proper ARIA attributes for expanded state
- Fixed keyboard navigation for dropdown options

### General Accessibility

- Added screen reader instructions for keyboard navigation
- Improved focus indicators with visible outlines
- Enhanced modal accessibility with proper focus trapping
- Added descriptive aria-labels to all interactive elements

## AI Integration in Development

This project utilized AI assistance through Cursor IDE for:

- Component structure optimization
- Accessibility improvements
- Code review and best practices
- UI/UX enhancements
- Bug detection and fixes
- Test implementation and fixes

## Known Limitations

1. **State Management**

   - Currently using local state management
   - No persistent storage implementation
   - Limited data caching

2. **Performance**

   - No code splitting implemented
   - Limited optimization for large datasets
   - No lazy loading for components

3. **Features**
   - No authentication system
   - Limited appointment creation flow
   - No real-time updates
   - No offline support

## Future Enhancements

1. **Technical Improvements**

   - Implement Redux or Context API for state management
   - Add TypeScript for better type safety
   - Implement code splitting and lazy loading
   - Improve test coverage

2. **Feature Additions**

   - User authentication and authorization
   - Real-time appointment updates
   - Calendar integration
   - Email notifications
   - Mobile app version

3. **Accessibility Improvements**

   - Add more ARIA landmarks
   - Implement focus management
   - Add skip links
   - Enhance keyboard navigation

4. **Performance Optimization**
   - Implement service workers for offline support
   - Add data caching
   - Optimize bundle size
   - Add performance monitoring

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/hneudev/DoctorApp.git
cd DoctorApp
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm start
# or
yarn start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

Run tests with coverage:

```bash
npm test -- --coverage
# or
yarn test --coverage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
