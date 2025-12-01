/* Vendor modules */
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";

/* Require the module-alias only on production or staging */
if (process.env.NODE_ENV !== 'development') {
    require('module-alias/register');
}

/* Custom modules */
import { errorHandler } from "./api/v1/middlewares/error_handler.middleware";
import apiRoutes from "./api/v1/routes/index";

/* Constants */
import { ENV } from "./configs/constants/env.constant";

const App = express();

App.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Body parser
App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));

// Static files
App.use(express.static(path.join(__dirname, "public")));

// Security headers
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

/* Serve TypeDoc documentation at /docs only on development/staging */
if (["development", "staging"].includes(process.env.NODE_ENV || '')) {
    App.use("/docs", express.static(path.join(__dirname, "docs")));
}

apiRoutes(App);


App.use(errorHandler);


const run_port = process.env.TEST_PORT || ENV.PORT;

App.listen(run_port, () => {
    console.log(`Server is running on http://localhost:${run_port}`);
});

export default App;
