# Deployment – MVP



## Environment



Production server hosted on Hetzner.



---



## Infrastructure Model



Single-server deployment:



- Backend (NestJS)

- Frontend (React)

- PostgreSQL

- Local file storage



---



## Frontend Build and Configuration



- Build: `npm run build` (from the `frontend/` directory) produces a production build (e.g. `frontend/build/` with Create React App).
- Environment: set `REACT_APP_API_URL` to the backend API base URL (e.g. `https://api.example.com` or `http://localhost:3000` in development).
- Serve the built static files (e.g. via Nginx) so the React app is served for all non-API routes; the backend API is typically proxied under a path or subdomain.



## Notes



- Files stored on server filesystem

- No cloud storage integration

- No container orchestration required

- No load balancing in MVP

