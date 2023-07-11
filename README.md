# Kilvvr Community

## Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Download and install [Nodejs](https://nodejs.org/en)
- Download and install [PostgreSQL](https://www.postgresql.org/download/) & How to install it using [Docker](https://www.docker.com/) from [Docker Hub](https://hub.docker.com/_/postgres)
- A web browser (e.g. Google Chrome, Mozilla Firefox, Microsoft Edge)
- A text editor (e.g. Visual Studio Code, Sublime Text)
- A platform for testing APIs like [Postman](https://www.postman.com/downloads/)

### Installing

1. Clone the repository to your local machine:

```HTTPS
https://github.com/Klivvr-OS/klivvr-community-be.git
```

2. Install [required packages]() `npm install`
3. Configure the [environment variables](), such as the database URL.
4. `npm run build` then `npm run start`

## Folder Structure

- package.json
- .gitignore
- tsconfig
- .eslintrc => Eslint + Prettier
- .env (not committed)
- .env.test (commit it)
- README.md
- src
  - app.ts
  - index.ts
  - routes
    - [routeFileName].ts
    - index.ts
  - modules
    - [module name]
      - repos
        - [moduleNameRepo].ts
      - services
        - [moduleNameService].ts
      - index.ts (In which you export your modules' services)
    - index.ts (In which you export your modules)
  - database
    - Prisma
      - migrations
      - schema.prisma
    - client.ts

## Tools & Technologies

- TypeScript
- Nodejs
  - Express.js
- PostgreSQL
- Prisma (ORM)
