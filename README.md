# EasyGive - Employee Donation Platform

EasyGive is a comprehensive SaaS application designed for HR departments to manage employee charitable donations. The platform enables easy paycheck deductions, automated employer matching, tax form generation, and engagement features to encourage charitable giving within organizations.

## 🚀 Features

### Core Features
- **Easy Paycheck Donations**: Employees can set up recurring or one-time donations as percentage or fixed amounts
- **Employer Matching**: HR configures matching programs (percentage or fixed amount) with annual limits
- **Tax Form Generation**: Automatic generation of IRS Schedule A forms and donation receipts
- **Multi-tenant Architecture**: Isolated data per company with role-based access control
- **Charity Database**: Integration with verified charity databases and search functionality

### Employee Features
- **Personal Dashboard**: Track donation history, impact metrics, and tax savings
- **Charity Discovery**: Browse and search verified charities by category
- **Gamification**: Badges, levels, and leaderboards to encourage participation
- **Mobile Responsive**: Fully responsive design for desktop and mobile use

### HR Admin Features
- **Company Dashboard**: Overview of total donations, participation rates, and matching usage
- **Employee Management**: Add, edit, and manage employee accounts
- **Matching Configuration**: Set up and manage company matching programs
- **Reporting Tools**: Generate detailed reports and export data
- **Payroll Integration**: API endpoints for payroll system integration

### Super Admin Features
- **System Management**: Manage multiple companies and their subscriptions
- **Charity Verification**: Verify and manage charity database
- **System Analytics**: Platform-wide statistics and insights

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with Prisma ORM
- **JWT** authentication with role-based access control
- **PDF generation** with pdf-lib for tax forms
- **Email notifications** with Nodemailer
- **Data encryption** for sensitive information

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **React Hook Form** for form management
- **Chart.js** for data visualization

### Development & Deployment
- **Concurrently** for running both frontend and backend
- **Nodemon** for backend development
- **Jest** for testing
- **ESLint** and **Prettier** for code quality

## 📁 Project Structure

```
easygive/
├── backend/                 # Node.js/Express backend
│   ├── prisma/
│   │   └── schema.prisma   # Prisma database schema
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── middleware/     # Authentication and error handling
│   │   ├── routes/         # API routes
│   │   ├── scripts/        # Database seeding scripts
│   │   └── server.js       # Main server file
│   ├── package.json
│   └── env.example         # Environment variables template
├── frontend/               # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Auth, etc.)
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd easygive
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp backend/env.example backend/.env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/easygive?schema=public"
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   
   # Encryption
   ENCRYPTION_KEY=your-32-character-encryption-key-here
   ```

4. **Start PostgreSQL**
   Make sure PostgreSQL is running on your system.

5. **Set up the database**
   ```bash
   cd backend
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Push schema to database
   ```

6. **Seed the database** (optional)
   ```bash
   npm run seed
   ```

7. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 3000) servers.

## 🐘 PostgreSQL Setup

### Local PostgreSQL Installation

#### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb easygive
```

#### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb easygive
```

#### Windows
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Create database using pgAdmin or command line:
   ```cmd
   createdb -U postgres easygive
   ```

#### Using Docker
```bash
# Run PostgreSQL in Docker
docker run --name postgres-easygive \
  -e POSTGRES_DB=easygive \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15

# Connect to database
docker exec -it postgres-easygive psql -U postgres -d easygive
```

### Database Configuration

Update your `.env` file with the correct PostgreSQL connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/easygive?schema=public"
```

Replace `username` and `password` with your PostgreSQL credentials.

### Demo Accounts

After seeding the database, you can use these demo accounts:

- **HR Admin**: `hr@techcorp.com` / `password123`
- **Employee**: `john.doe@techcorp.com` / `password123`
- **Employee**: `jane.smith@techcorp.com` / `password123`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### User Endpoints
- `GET /api/users` - Get all users (HR Admin)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create user (HR Admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (HR Admin)

### Company Endpoints
- `GET /api/companies` - Get all companies (Super Admin)
- `GET /api/companies/:id` - Get single company
- `POST /api/companies` - Create company (Super Admin)
- `PUT /api/companies/:id` - Update company
- `PUT /api/companies/:id/matching` - Update matching program

### Charity Endpoints
- `GET /api/charities` - Get all charities
- `GET /api/charities/:id` - Get single charity
- `GET /api/charities/featured` - Get featured charities
- `GET /api/charities/category/:category` - Get charities by category
- `GET /api/charities/search` - Search charities

### Donation Endpoints
- `GET /api/donations` - Get all donations
- `GET /api/donations/:id` - Get single donation
- `POST /api/donations` - Create donation
- `PUT /api/donations/:id/status` - Update donation status
- `PUT /api/donations/:id/cancel` - Cancel donation

### Tax Endpoints
- `GET /api/tax/records` - Get user tax records
- `POST /api/tax/records/generate` - Generate tax record
- `GET /api/tax/records/:id/download/:type` - Download tax document

## 🔧 Configuration

### Company Setup
1. Create a company account through the admin panel
2. Configure matching program settings
3. Set up payroll integration (if applicable)
4. Add employees to the platform

### Matching Program Configuration
- **Percentage Matching**: Match employee donations by percentage (e.g., 50% match)
- **Fixed Amount Matching**: Match with a fixed amount per donation
- **Annual Limits**: Set maximum matching amounts per year
- **Preferred Charities**: Restrict matching to specific charities

### Security Features
- JWT-based authentication with role-based access control
- Data encryption for sensitive information
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration for secure cross-origin requests

## 🧪 Testing

Run the test suite:
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚀 Deployment

### Backend Deployment (Heroku/Render)
1. Set up environment variables in your hosting platform
2. Configure PostgreSQL database connection string
3. Deploy the backend application

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend application
2. Configure environment variables
3. Deploy to your hosting platform

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your-production-postgresql-connection-string
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=your-production-frontend-url
ENCRYPTION_KEY=your-production-encryption-key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- **Mobile App**: Native iOS and Android applications
- **Advanced Analytics**: Machine learning insights and recommendations
- **Social Features**: Team challenges and social sharing
- **Integration Marketplace**: More payroll and HR system integrations
- **International Support**: Multi-currency and international tax compliance
- **Advanced Reporting**: Custom report builder and scheduled reports

## 📊 System Requirements

### Minimum Requirements
- Node.js 18+
- PostgreSQL 12+
- 2GB RAM
- 1GB storage

### Recommended Requirements
- Node.js 20+
- PostgreSQL 15+
- 4GB RAM
- 5GB storage

---

Built with ❤️ for making charitable giving easier and more engaging in the workplace.
