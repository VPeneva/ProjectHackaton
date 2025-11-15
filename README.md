A web app for reporting, and acting upon issues with public infrastructure faced by civilians.

It is built upon an Express powered API with React frontend, the role of database is served by sqlight, operations upon the database are done with Prisma.

Local API configuration
-----------------------

To point the frontend at a custom backend address use a local environment file in the `frontend` folder. Create `frontend/.env.local` and add:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Add `frontend/.env.local` to `.gitignore` so it won't be committed — the project already ignores `.local` files by default.
