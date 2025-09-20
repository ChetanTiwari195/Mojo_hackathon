# Shiv Accounts Cloud

A comprehensive, cloud-based accounting solution designed to streamline financial management for businesses of all sizes.

## 🚀 Features

- **Dashboard:** An intuitive overview of your financial health.
- **Invoicing:** Create, send, and manage professional invoices effortlessly.
- **Expense Tracking:** Log and categorize expenses on the go.
- **Financial Reporting:** Generate detailed reports like Profit & Loss, Balance Sheets, and more.
- **Secure Cloud Storage:** Your financial data is securely stored and accessible from anywhere.
- **Multi-user Access:** Collaborate with your team with role-based permissions.

## 🧑‍💻 Developed by Team Mojo

This project is the result of the collaborative effort of **Team Mojo**.

- **Abhimanyu Kumar**
- **Chetan Tiwari**
- **Atul Kumar Pandey**

## 🛠️ Getting Started

### Prerequisites

- [List prerequisites, e.g., Node.js, Python, Docker]

### Installation

1.  Clone the repository:
    ```sh
    git clone https://github.com/your-repository/shiv-accounts-cloud.git
    ```
2.  Navigate to the project directory:
    ```sh
    cd shiv-accounts-cloud
    ```
3.  Install dependencies:
    ```sh
    # Example for a Node.js project
    npm install
    ```
4.  Configure your environment variables by creating a `.env` file.
    ```
    DB_HOST=...
    API_KEY=...
    ```
5.  Run the application:
    ```sh
    npm start
    ```

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/NewFeature`)
3.  Commit your Changes (`git commit -m 'Add some NewFeature'`)
4.  Push to the Branch (`git push origin feature/NewFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE.md` file for more information.

---

## Stock Report Feature

- Stock report showing Purchased Qty (+), Sales Qty (-), Available

---

## Tech Stack

- **Frontend:** React.js, Vite, shadcn/ui, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MySQL

## Project Setup

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18.x or later)
- [MySQL](https://dev.mysql.com/downloads/installer/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-folder>
```

### 2. Backend Setup (Server)

1.  **Navigate to the server directory:**

    ```bash
    cd server
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up the database:**

    - Make sure your MySQL server is running.
    - Create a new database for the project, e.g., `shiv_accounts`.

4.  **Create an environment file:**

    - Create a file named `.env` in the `server` directory.
    - Add the following configuration, replacing the placeholder values with your MySQL credentials.

    ```env
    # .env
    PORT=3001
    DB_HOST=localhost
    DB_USER=your_mysql_user
    DB_PASSWORD=your_mysql_password
    DB_NAME=shiv_accounts
    ```

### 3. Frontend Setup (Client)

1.  **Navigate to the client directory from the root folder:**

    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running the Application

You need to run both the backend and frontend servers in separate terminals.

### 1. Run the Backend Server

- In the `server` directory, run:
  ```bash
  npm run dev
  ```
- The server will start, typically on `http://localhost:3001`.

### 2. Run the Frontend Client

- In the `client` directory, run:
  ```bash
  npm run dev
  ```
- The React development server will start, and you can view the application in your browser, usually at `http://localhost:5173`.
