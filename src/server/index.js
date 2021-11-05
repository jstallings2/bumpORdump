
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const envConfig = require("simple-env-config");
const cors = require('cors');
const cookieParser = require('cookie-parser');

const favicon = require("serve-favicon");

const env = process.env.NODE_ENV ? process.env.NODE_ENV : "dev";

const setupServer = async () => {
    // Get the app config
    const conf = await envConfig("./config/config.json", env);
    const port = conf.port;

    // Setup our Express pipeline
    let app = express();
    app.engine("pug", require("pug").__express);
    app.set("views", __dirname);
    app.use(express.static(path.join(__dirname, "../../public")));
    app.use(favicon(path.resolve(__dirname, "../../public/favicon.ico")));
    app.use(cors());
    app.use(cookieParser())
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    // Import our routes
    require("./api")(app);

    // Give them the SPA base page
    app.get("*", (req, res) => {
        res.render("base.pug", {});
    });

    let server = app.listen(port, () => {
        console.log("bumpORdump app listening on " + server.address().port);
    });
};

setupServer();