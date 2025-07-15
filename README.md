# Wholesale Management Application

A web application for managing wholesale items, user authentication, and sales tracking.

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or provide a MongoDB URI)
- npm or yarn

### Setup Instructions
1. **Backend** (unchanged):
   - Navigate to `server`:
     ```bash
     cd server
     ```
   - Ensure `.env`:
     ```
     MONGODB_URI=mongodb://localhost:27017/wholesale
     JWT_SECRET=your_jwt_secret_key
     PORT=5005
     ```
   - Install dependencies and start:
     ```bash
     npm install
     npm start
     ```
   - Verify: See `Server running on port 5005` and `Connected to MongoDB`.

2. **Frontend**:
   - Navigate to `client`:
     ```bash
     cd client
     ```
   - Install updated dependencies:
     ```bash
     rm -rf node_modules package-lock.json
     npm install
     ```
   - Start the frontend:
     ```bash
     npm start
     ```
   - Verify: Open `http://localhost:3003` and check if the warning is gone in the terminal.

3. **MongoDB** (unchanged):
   - Ensure MongoDB is running:
     ```bash
     mongod
     ```
   - Verify data (if needed):
     ```javascript
     use wholesale
     db.users.find()
     db.items.find()
     db.sales.find()
     ```
   - Create test data if none exists:
     ```javascript
     // Admin user
     db.users.insertOne({
       username: "admin1",
       password: "<hashed_password>",
       email: "admin1@example.com",
       role: "admin"
     })
     // Test items
     db.items.insertMany([
       { name: "Widget A", serialNumber: "SN001", description: "Test item A", price: 10 },
       { name: "Widget B", serialNumber: "SN002", description: "Test item B", price: 15, assignedTo: "<userId>" },
       { name: "Widget C", serialNumber: "SN003", description: "Test unassigned item", price: 20 }
     ])
     // Test sale
     db.sales.insertOne({
       item: ObjectId("<itemId>"),
       buyerName: "John Doe",
       saleDate: ISODate("2025-07-01"),
       user: ObjectId("<userId>")
     })
     ```

4. **Test the Application**:
   - Open `http://localhost:3003/login`. Verify the modern UI (blue gradient buttons, red delete button, modal notifications).
   - Log in as an admin (e.g., `admin1`, `password123`). Check the sidebar for Dashboard, Add User, Items by User, Sales by User.
   - **Test Delete Button**:
     - Go to `/` (Dashboard), in the Users table:
       - Verify the “Delete” button is red (red gradient, `btn-danger`).
       - Delete a user with no assigned items or sales, verify a green modal (“User deleted successfully!”) disappears after 3 seconds.
       - Try deleting a user with items/sales, verify a red modal (e.g., “Cannot delete user with assigned items”).
   - **Test Other Features**:
     - Add an item in Dashboard, verify a green modal for success or red for errors (e.g., duplicate name/serial).
     - Assign an item, verify the dropdown shows correct usernames and a green modal on success.
     - Go to `/admin/add-user`, add a user with a unique email, verify green modal.
     - Go to `/admin/sales-by-user`, export PDF, verify green modal and `.tex` file download.
     - Go to `/admin/items-by-user`, export PDF, verify green modal.
     - As a non-admin, go to `/`, verify only assigned items are shown.
   - **Check Warning**:
     - In the terminal running `npm start`, ensure no `(node:33660) [DEP0060] DeprecationWarning: The util._extend API is deprecated` warning appears.

### Troubleshooting
- **Warning Persists**:
  - If the `util._extend` warning remains after updating `react-scripts`:
    ```bash
    grep -r "util._extend" node_modules
    ```
    Identify the dependency (e.g., `webpack`, `babel`, or another package).
  - Temporary workaround: Suppress the warning by modifying `client/package.json` scripts:
    ```json
    "scripts": {
      "start": "NODE_OPTIONS='--no-deprecation' PORT=3003 react-scripts start",
      "build": "react-scripts build"
    }
    ```
    Re-run `npm start` and verify the warning is gone.
  - Share the output of `grep` or the terminal log if the warning persists.

- **Dependency Issues**:
  - If `npm install` fails due to `react-scripts@5.1.0`:
    ```bash
    npm install react-scripts@5.0.1 --force
    ```
    Then try a lower version (e.g., `5.0.2`) or check compatibility:
    ```bash
    npm install react-scripts@5.0.2
    ```
  - Verify React version compatibility:
    ```bash
    npm list react react-dom
    ```

- **UI Issues**:
  - If the delete button isn’t red:
    - Verify `client/src/index.css` has the `btn-danger` class with red gradient (`from-red-600 to-red-700`).
    - Check `UserManagement.js` uses `btn-danger` for the delete button.
    - Open browser console (F12 → Console) for CSS errors.
    - Share a screenshot of the Users table.
  - If modals don’t disappear after 3 seconds:
    - Verify `index.css` has `animate-slide-in` with the correct keyframes (0% to 100% with opacity and transform).
    - Check browser console for JavaScript errors.

- **Port Issues**:
  - Check for conflicts:
    ```bash
    lsof -i :3003
    lsof -i :5005
    ```
    Kill conflicting processes:
    ```bash
    kill -9 <pid>
    ```

- **CORS**:
  - Ensure `server/server.js` has:
    ```javascript
    app.use(cors({ origin: 'http://localhost:3003', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
    ```

- **MongoDB Data**:
  - If delete or other features fail, verify data:
    ```javascript
    db.users.find()
    db.items.find()
    db.sales.find()
    ```
  - Ensure no duplicate item names/serial numbers:
    ```javascript
    db.items.aggregate([
      { $group: { _id: "$name", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ])
    db.items.aggregate([
      { $group: { _id: "$serialNumber", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ])
    ```
    Remove duplicates if needed:
    ```javascript
    db.items.deleteMany({ name: "<duplicate_name>" })
    ```

## Usage
- **Admin**: Can create items, assign items to users, and view all users.
- **User**: Can view their assigned items, add sales with buyer name and sale date, and view their sales history.
- Access the app at `http://localhost:3000`.

## Features
- User authentication (login/register)
- Role-based access (admin/user)
- Item management (create/assign items)
- Sales tracking (add/view sales)
- Responsive UI with Tailwind CSS