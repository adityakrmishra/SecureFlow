# Contributing to SecureFlow

First off, thank you for considering contributing to SecureFlow! It's people like you that make open-source projects great. 

This document provides guidelines and instructions for contributing to this repository.

## 🚀 Tech Stack

Before diving in, please ensure you are familiar with our core stack:
* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Database & ORM:** Prisma
* **Styling:** Tailwind CSS & Radix UI (via `shadcn/ui`)

## 🛠️ Getting Started

To get a local copy up and running, follow these simple steps:

### 1. Fork & Clone
Fork the repository to your own GitHub account and clone it to your local machine.
```bash
git clone https://github.com/YOUR_USERNAME/SecureFlow.git
cd SecureFlow
```

#### 2. Install Dependencies
We recommend using standard `npm`.
```bash
npm install
```

#### 3. Environment Variables
Copy the example environment file and fill in the required values.
```Bash
cp .env.example .env
```

#### 4. Database Setup
This project uses Prisma. Push the schema to your local database and generate the Prisma client.
```Bash
npx prisma generate
npx prisma migrate dev
```

#### 5. Run the Development Server
Start the development server.
```Bash
npm run dev
```
Open http://localhost:3000 with your browser to see the result.

## 🌿 Branching Strategy
Please follow this naming convention for your branches to keep the repository organized:
- `feature/your-feature-name` (For new features)
- `fix/issue-name` (For bug fixes)
- `docs/documentation-update` (For documentation improvements)
- `refactor/component-name` (For code refactoring)

## 📝 Commit Guidelines
We use Conventional Commits for our commit messages. This leads to more readable messages that are easy to follow.
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

Example:

`feat: add GitHub webhook authentication flow`

## 🔄 Pull Request Process
1. Ensure your code follows the existing style and conventions.
2. Run `npm run lint` and `npm run build` to ensure there are no build or linting errors.
3. Update the `README.md` or `docs/` if your changes require documentation updates.
4. Submit your PR and include a clear description of the problem you are solving and the solution you have implemented.
5. Wait for a maintainer to review your code. We may suggest some changes before merging.

Thank you for your contributions!