# Canteen Web-App

## Vision Statement
This project aims to digitize small-scale internal canteens for government offices. The goal is to provide an integrated solution:
- A user-facing app to browse menus, place orders, make payments, and track order statuses.
- A kitchen-side app to manage menu items, incoming orders, and preparation workflow.
  
**Tech Stack:**  
- **Frontend:** React (TypeScript), Vite  
- **Backend:** Node.js, Express.js, Mongoose (MongoDB), WebSockets for real-time updates  
- **Authentication:** Clerk  
- **Deployment:** A single backend server serving both the user-side and kitchen-side apps.

We are currently focusing on building an MVP for demonstration, with the potential to scale into a subscription service for multiple canteens and clients in the future.

## Repository Links
- **User-Side Frontend:** [Canteen (Frontend)](https://github.com/omkar861856/Canteen)
- **Kitchen-Side Frontend:** [Kitchen (Frontend)](https://github.com/omkar861856/Kitchen)
- **Common Backend:** [Canteen-Server (Backend)](https://github.com/omkar861856/Canteen-Server)

## Configuration & Environment Setup

### .env Files
You will need to set up two environment files:  
1. **`.env.development`** (for local development on `localhost`)  
2. **`.env.production`** (for the deployed environment on a server)

**Example:**
```env
# .env.development
VITE_API_URL="http://localhost:3000" 

VITE_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key_for_development"

# .env.production
VITE_API_URL="https://your-deployed-backend-link.com"

VITE_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key_for_production"

## Generate API Keys on Clerk
Create or use your existing project in Clerk’s Dashboard to generate the publishable key. This will be used for authentication and is required to be set in both .env.development and .env.production.

## How to Contribute
1. Ask Questions & Request Clarifications: Feel free to open Issues on the respective repositories if you have any doubts.
2. Propose Features: You can create Pull Requests or discuss enhancements in GitHub Issues.
3. Bug Reports: If you encounter any bugs, please report them with details for quick resolution.
