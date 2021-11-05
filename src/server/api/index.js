"use strict";

module.exports = (app) => {
    require("./v1/auth")(app);
    require("./v1/song")(app);
};