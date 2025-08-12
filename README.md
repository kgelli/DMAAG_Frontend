# DMMAG

## Project Repositories

- Frontend: [DMMAG_Frontend](https://github.com/YOUR_USERNAME/DMMAG_Frontend/tree/master)
- Backend: [DMMAG_GraphQL](https://github.com/YOUR_USERNAME/DMMAG_GraphQL/tree/master)

## Prerequisites

- Node.js and npm installed
- PostgreSQL installed and running
- Git (for version control)

## Database Setup

1. Locate the database dump file in the Hydra files section
2. Download and save the dump file to your local machine
3. Create a new PostgreSQL database:
   ```sql
   CREATE DATABASE west_DMMAG;
   ```
4. Import the database dump:
   ```bash
   psql -U postgres -d west_DMMAG < path_to_dump_file
   ```

## Project Setup

### 1. Clone the Repositories

```bash
# Clone Frontend
git clone https://github.com/<USERNAME>/DMMAG_Frontend.git
cd DMMAG_Frontend

# Clone Backend (in a separate terminal)
git clone https://github.com/<USERNAME>/DMMAG_GraphQL.git
cd DMMAG_GraphQL
```

### 2. GraphQL Server Setup

Navigate to the GraphQL server directory and install dependencies:

```bash
cd DMMAG_GraphQL
npm install
```

#### Environment Configuration

1. Install the dotenv package:

   ```bash
   npm install dotenv
   ```

2. Create a `.env` file in the project root with your database credentials. Use `.env.example` as a reference for required variables.

#### Test Database Connection

Before starting the server, test your database connection:

```bash
node testConnection.js
```

If the connection is successful, start the GraphQL server:

```bash
npm start
```

The GraphQL server will be available at: `http://localhost:4000/graphql`

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd DMMAG_Frontend
```

Install dependencies:

```bash
npm install
```

Required packages (already in package.json):

- React
- Tailwind CSS
- Babel

Start the React application:

```bash
npm start
```

## Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: GraphQL server with Apollo Server
- **Database**: PostgreSQL (west_DMMAG database)
- **Schema**: DMMAG
- **ORM**: TypeORM
- **Build tools**: Babel

## Environment Variables

The project uses environment variables for configuration stored in a `.env` file.

## Important Notes

- Ensure PostgreSQL is running on the specified port
- Make sure the DMMAG schema exists in the west_DMMAG database
- The GraphQL server should be running before starting the frontend

## Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running:

   ```bash
   # Check if PostgreSQL is running
   pg_ctl status

   # Or check processes
   ps aux | grep postgres
   ```

2. Test database connection:

   ```bash
   node testConnection.js
   ```

3. Verify environment variables are loaded:
   ```bash
   node -e "require('dotenv').config(); console.log(process.env.DB_HOST);"
   ```

### Common Issues

- **"Unable to connect to database"**: Check your `.env` file and PostgreSQL service
- **"Module not found"**: Run `npm install` in the correct directory
- **"Port already in use"**: Change the PORT in your `.env` file or stop the conflicting process

### File Structure Check

Your project should look like this:

```
DMMAG_GraphQL/
├── config/
├── models/
├── node_modules/
├── .env                 ← Create this with your credentials
├── .env.example         ← Reference template
├── .gitignore
├── db.js
├── index.js
├── package.json
├── testConnection.js
└── README.md
```

## Development Commands

```bash
# Install dependencies
npm install

# Test database connection
node testConnection.js

# Start GraphQL server (in DMMAG_GraphQL directory)
npm start

# Start Frontend (in DMMAG_Frontend directory)
npm start

# Run tests
npm test
```

## Getting Started Checklist

- [ ] PostgreSQL installed and running
- [ ] Database dump imported
- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created
- [ ] Database connection tested
- [ ] GraphQL server started
- [ ] Frontend application started

For any questions or issues, please update the Hydra ticket or contact the development team.
