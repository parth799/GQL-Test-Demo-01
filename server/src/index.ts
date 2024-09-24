import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import createApolloGraphqlServer from "./graphql";
import UserService from "./services/user";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.use(express.json());

  const graphqlServer = await createApolloGraphqlServer();

  app.get("/", (req, res) => {
    res.json({ message: "Server is running!!" });
  });

  app.use(
    "/graphql",
    expressMiddleware(graphqlServer, {
      context: async ({ req }) => {
        const authHeader = req.headers["authorization"]; 
        if (authHeader) {
          try {
            const user = await UserService.decodeJWTToken(authHeader);
            return { user };
          } catch (error: any) {
            console.error("Invalid token:", error.message);
            return {}; 
          }
        }
        return {};
      },
    })
  );

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
