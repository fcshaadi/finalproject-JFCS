# Digital Legacy Vault - Frontend

React frontend application for the Digital Legacy Vault MVP.

## Features

- User authentication (Login/Register)
- Role-based routing and dashboard views
- Item management (Create, Edit, Delete, Release)
- File upload and download
- Responsive design

## Prerequisites

- Node.js (v18 or superior)
- npm or yarn

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set:
```
REACT_APP_API_URL=http://localhost:3000
```

## Running the Application

Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000` (or the next available port).

## Building for Production

Build the application for production:
```bash
npm run build
```

The build folder will contain the optimized production build.

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable components
│   │   ├── ItemCard.jsx
│   │   ├── ItemForm.jsx
│   │   ├── ItemList.jsx
│   │   ├── PrivateRoute.jsx
│   │   ├── UserDashboard.jsx
│   │   ├── BeneficiaryDashboard.jsx
│   │   └── BothRolesDashboard.jsx
│   ├── context/            # React Context
│   │   └── AuthContext.jsx
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   ├── services/           # API services
│   │   └── api.js
│   ├── utils/              # Utility functions
│   │   └── jwt.js
│   ├── App.js              # Main app component
│   ├── App.css
│   ├── index.js            # Entry point
│   └── index.css
├── package.json
└── README.md
```

## Role-Based Features

### User Role
- Create, edit, delete items
- Release items for beneficiaries
- View all own items (released and unreleased)

### Beneficiary Role
- View only released items
- Read-only access
- Download files

### Both Roles
- Two separate sections:
  - "My Vault" (editable items)
  - "Accessible Items" (read-only released items)

## API Integration

The frontend communicates with the NestJS backend API. All API calls are handled through the `services/api.js` module.

### Authentication
- JWT tokens stored in localStorage
- Automatic token injection in API requests
- Automatic redirect to login on 401 errors

## Environment Variables

- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:3000)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

