# Real-Time Clock Dashboard

## Objectives

1. Develop a responsive dashboard that displays accurate local time through animated analog and digital clocks, including the current date and UTC offset.
2. Enable users to manage multiple world clocks by selecting, viewing, and removing time zones in real time.
3. Provide practical time-management tools, including configurable alarms and a countdown timer, with clear controls and reliable visual or audio notifications.

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