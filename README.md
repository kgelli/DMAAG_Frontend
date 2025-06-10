=======

# DMAAG

## Project Repositories

- Frontend: [DMAAG_Frontend](https://github.com/kgelli/DMAAG_Frontend/tree/master)
- Backend: [DMAAG_GraphQL](https://github.com/kgelli/DMAAG_GraphQL/tree/master)

## Prerequisites

- Node.js and npm installed
- PostgreSQL installed and running
- Git (for version control)

## Database Setup

1. Locate the database dump file in the Hydra files section
2. Download and save the dump file to your local machine
3. Create a new PostgreSQL database:
   ```sql
   CREATE DATABASE west_dmaag;
   ```
4. Import the database dump:
   ```bash
   psql -U postgres -d west_dmaag < path_to_dump_file
   ```

## Project Setup

### 1. Clone the Repositories

```bash
# Clone Frontend
git clone https://github.com/kgelli/DMAAG_Frontend.git
cd DMAAG_Frontend

# Clone Backend (in a separate terminal)
git clone https://github.com/kgelli/DMAAG_GraphQL.git
cd DMAAG_GraphQL
```

### 2. GraphQL Server Setup

Navigate to the GraphQL server directory and install dependencies:

```bash
cd DMAAG_GraphQL
npm install
```

Configure database connection:

1. Check the following configuration in your connection files:

   ```javascript
   {
     type: 'postgres',
     host: 'localhost',
     port: 5432,
     username: 'postgres',
     password: 'your_password', // Update this
     database: 'west_dmaag',
     schema: 'DMAAG',
     synchronize: false,
     logging: true
   }
   ```

2. Update the password in:
   - `config/database.js`
   - `testConnection.js`
   - Any other configuration files containing database credentials

Start the GraphQL server:

```bash
npm start
```

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd DMAAG_Frontend
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

- Frontend: React.js with Tailwind CSS
- Backend: GraphQL server
- Database: PostgreSQL (west_dmaag database)
- Schema: DMAAG
- Build tools: Babel

## Important Notes

- Ensure PostgreSQL is running on port 5432
- Update the database password in all configuration files
- Make sure the DMAAG schema exists in the west_dmaag database
- The GraphQL server should be running before starting the frontend

## Troubleshooting

If you encounter any issues:

1. Verify PostgreSQL is running and accessible
2. Check if database credentials are correct in all config files
3. Ensure the DMAAG schema exists in west_dmaag database
4. Verify all dependencies are installed:
   ```bash
   npm install
   ```
5. For additional help, refer to the Hydra ticket: https://hydra.gsu.edu/issues/1629

## Development Commands

```bash
# Install dependencies
npm install

# Start GraphQL server (in DMAAG_GraphQL directory)
npm start

# Start Frontend (in DMAAG_Frontend directory)
npm start

# Run tests
npm test
```

For any questions or issues, please update the Hydra ticket or contact the development team.
