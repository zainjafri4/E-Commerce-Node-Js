# E-Commerce Node.js Backend

This project is a Node.js backend for a small e-commerce application, offering essential functionalities to support a complete online shopping experience. It incorporates various features like user authentication, product management, order processing, and more, making it a robust solution for managing an e-commerce platform.

## Features

- **User Authentication & Verification:** Secure login and registration using JWT, along with email-based user verification.
- **Product Management:** CRUD operations for products, including product listing and search capabilities.
- **Order Processing:** Comprehensive order management system, including shopping cart functionalities and checkout.
- **Invoice Generation:** Automated generation of invoices upon order completion.
- **Email Notifications:** Integrated email service for sending order confirmations and other notifications.
- **Product Reviews:** Allows users to review and rate products.
- **Cron Jobs:** Automated task to expire products after 30 days.
- **RESTful API Design:** Efficient communication with the frontend using RESTful principles.

## Technologies Used

- **Node.js:** Backend runtime environment.
- **Express.js:** Web framework for routing and middleware management.
- **MongoDB:** NoSQL database for data storage and management.
- **JWT:** For secure user authentication and session management.
- **Nodemailer:** For sending emails from the server.
- **Docker:** Containerization of the application for consistent deployment.
- **Cron Jobs:** For scheduling automated tasks.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/zainjafri4/E-Commerce-Node-Js
   ```

2. Navigate to the project directory:

   ```bash
   cd E-Commerce-Node-Js
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables:

   - Create a `.env` file in the root directory.
   - Add necessary environment variables (e.g., database connection strings, JWT secret, email credentials).

5. Start the application:

   ```bash
   npm start
   ```

6. Access the API at `http://localhost:3000`.

## Usage

- Use the API to manage users, products, orders, and more.
- Integrate the backend with a frontend application for a complete e-commerce experience.
---

## Skills

- **Node.js**
- **JavaScript**
- **MongoDB**
- **API Development**
- **REST APIs**
- **Web Development**
