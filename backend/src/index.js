import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';



dotenv.config();

const app = express();
mongoose.connect(process.env.MONGO_URL,)
.then(() => console.log("DB Connected"))
.catch((err) => console.log(err));

const typeDefs =` type Query{
hello: String}`

const resolvers = {
    Query: {
        hello:() =>"Hello Banking App",
    }
}
 const server = new ApolloServer({
    typeDefs,
    resolvers,
 });

 const startServer = async () =>{
    await server.start();

    app.use(
        '/graphql',
        cors(),
        express.json(),
        expressMiddleware(server)
    )

    const  PORT = process.env.PORT || 4000;
    app.listen(PORT, ()=>{
        console.log(` Server ready at http://localhost:${PORT}/graphql`)
    })
 }
 startServer()