import dotenv from "dotenv";
dotenv.config();
const config = {
    client_url: process.env.CLIENT_URL || "http://localhost:3000",
    database_url: process.env.DATABASE_URL,
    better_auth_secret: process.env.BETTER_AUTH_SECRET,
    better_auth_url: process.env.BETTER_AUTH_URL,
    port: process.env.PORT || 5000,
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET
}
export default config;
