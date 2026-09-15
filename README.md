# Attendora Management System — Vanilla Web Version

This folder is a standalone HTML, CSS, and JavaScript version of the Attendora Management System. It does not require React, Node.js, pnpm, or a build step.

## Run in VS Code

1. Extract the project folder.
2. Open the folder in VS Code.
3. Open `index.html` with the **Live Server** extension, or double-click `index.html` to open it in a browser.
4. Sign in with the pre-filled demo values and select Admin, Faculty, or Student.

For the best result, use Live Server because it serves the local image assets correctly.

## Included files

```text
cloud-attendance-vanilla/
├── index.html
├── README.md
├── assets/
│   ├── cloud-attendance-analytics-orbit.png
│   ├── cloud-attendance-login-illustration.png
│   ├── cloud-attendance-orbit-logo.png
│   └── cloud-attendance-status-visual.png
├── css/
│   └── style.css
└── js/
    └── script.js
```

## Included features

The standalone build includes role-based login, responsive navigation, admin, faculty, and student dashboards, weekly and monthly analytics charts, present/absent/late status handling, student and faculty CRUD modals, search, filtering, sorting, attendance marking, bulk selection, reset and save actions, toast notifications, CSV report export, browser printing, timetable planning, notifications, settings, system status, and localStorage persistence.

## External resources

The interface loads Manrope and DM Sans from Google Fonts and Chart.js from jsDelivr. An internet connection is required for those resources. The branded image assets are bundled locally in the `assets` folder.

## Color rules

The product uses Command Indigo `#312E81`, Secondary Indigo `#4F46E5`, Accent Violet `#8B5CF6`, and Page Background `#F5F3FF`. Attendance states use only Present `#0F9F8F`, Absent `#D45B72`, and Late `#D89A4A`.

## Demo persistence

Student records, faculty records, attendance statuses, and the selected role are stored in browser localStorage. Clear site data in the browser to restore the initial sample records.

## Role permissions and approval workflow

The updated portal uses separate role-specific workspaces. **Students** can open only Dashboard and Attendance, view their own profile and attendance, and cannot edit records or view other users. **Faculty** can open only their own dashboard, assigned-class attendance, reports for classes they teach, messages, and timetable. Faculty profiles are view-only, and faculty do not have access to student or faculty management, system status, settings, or admin requests.

Faculty attendance and profile changes are submitted as **pending requests**. They do not change live records immediately. The administrator opens the **Approval requests** route, reviews the request, and chooses Approve or Reject. Approved attendance changes are applied to the stored attendance record; approved faculty profile changes are applied to the faculty directory. The administrator remains the only role with access to all records and management pages.

The demo faculty accounts include `FAC-081`, `FAC-082`, `FAC-083`, and `FAC-084`. The active user identifier is stored in localStorage as `cloud-user-id` so separate faculty accounts can be tested independently.

## Production note

This is a frontend-only demonstration. For production use, replace sample data and localStorage with authenticated server-side APIs, a database, role-based permissions, input validation, and secure report generation.
