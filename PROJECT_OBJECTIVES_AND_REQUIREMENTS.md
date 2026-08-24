# Real-Time Clock Dashboard

## Objectives

1. To understand and implement React components for creating a responsive clock dashboard.
2. To learn how to handle real-time date, time, and time-zone conversions.
3. To implement practical time-management features such as world clocks, alarms, and countdown timers.
4. To understand state management and dynamic UI controls in React.
5. To improve understanding of responsive and interactive web application development.

## Software Requirements

### Functional Requirements

- The application shall update displayed times continuously without requiring a page refresh.
- The application shall show both analog and digital representations of the selected local time.
- Users shall be able to add and remove clocks for supported world time zones.
- Users shall be able to create, view, enable, disable, and delete alarms.
- The application shall provide a countdown timer with start, pause, reset, and completion notification controls.
- The interface shall adapt to desktop, tablet, and mobile screen sizes.

### Technical Requirements

- Frontend framework: React 19.
- Build and development tool: Vite.
- Languages: JavaScript, HTML, and CSS.
- Time handling: JavaScript Date and internationalization APIs, including `Intl.DateTimeFormat`.
- Notifications: Web Audio API for optional alarm audio feedback.
- Package management: npm.
- The project shall support `npm run dev`, `npm run build`, and `npm run lint`.

### System Requirements

- A modern web browser with JavaScript enabled.
- Node.js and npm for local development.
- Internet access is required to install project dependencies; the running dashboard itself does not require a backend service.