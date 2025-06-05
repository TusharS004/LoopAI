import express from "express";
import routes from "./routes.js"; // Assuming you have a routes/index.js file
import { configDotenv } from "dotenv";

configDotenv();

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());

app.use('/', routes);

export default app;

if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on ${port}`);
  });
}