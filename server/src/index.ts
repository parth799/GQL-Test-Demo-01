import express from "express";
import { expressMiddleware } from "@apollo/server/express4";
import createApolloGraphqlServer from "./graphql";
import UserService from "./services/user";
import fileUpload from "express-fileupload";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  app.use(express.json());
  app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    })
  );
  const graphqlServer = await createApolloGraphqlServer();

  app.get("/test", (req, res) => {
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
