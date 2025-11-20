/* Vendor modules */
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import * as Sentry from "@sentry/node";


/* Require the module-alias only on production or staging */
if (process.env.NODE_ENV !== 'development') {
    require('module-alias/register');
}

/* Custom modules */
import { errorHandler } from "./api/v1/middlewares/error_handler.middleware";
import apiRoutes from "./api/v1/routes/index";

/* Constants */
import { ENV, SENTRY } from "./configs/constants/env.constant";

const App = express();
App.use(express.json());
App.use(express.urlencoded({ extended: true }));

App.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

/* Serve TypeDoc documentation at /docu only on development and staging */
if (["development", "staging"].includes(process.env.NODE_ENV || '')) {
    App.use("/docs", (req, res, next) => { next(); });
    App.use("/docs", express.static(path.join(__dirname, "docs")));
}

// Sentry.init({
//     dsn: SENTRY.dsn,
//     environment: process.env.NODE_ENV
// });

/**
 * Cross-origin Resource Sharing
 * @todo Update to correct origin
 */
App.use(cors({
    origin: ["*"],
    credentials: true
}));

App.set("views", path.join(__dirname, "views"));
App.set("view engine", "ejs");

App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));

App.use(express.static(path.join(__dirname, "public")));
/**
 * Security Headers
 * @todo Update to correct security policies
 */
App.use(
    helmet({
        xPoweredBy: true,
        contentSecurityPolicy: {
            directives: {
                "script-src": ["'self'"],
                "script-src-elem": ["'self'"],
                "connect-src": ["'self'"],
                "default-src": ["'self'"]
            }
        }
    })
);

App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));

/* Initialize the API routes of this service */
apiRoutes(App);

/* Global error catcher/handler */
App.use(errorHandler);

/* TEST_PORT is for running automated tests */
const run_port = process.env.TEST_PORT || ENV.PORT;

App.listen(run_port, () => {
    console.log(`Server is running on http://localhost:${run_port}`);
});

export default App;