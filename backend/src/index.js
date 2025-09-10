import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5'; 
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import accountRoutes from "./routes/AccountRoutes.js";
import { typeDefs, resolvers } from './graphql/schema.js';  
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(express.json());

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startServer = async () => {
  await server.start();

  app.use("/api/accounts", accountRoutes)

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        authMiddleware(req, res, () => {});
        return { user: req.user };
      },
    })
  );

  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log('DB Connected');
      const PORT = process.env.PORT || 4000;
      app.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
      });
    })
    .catch((err) => {
      console.error('DB connection error:', err);
    });
};

startServer();
