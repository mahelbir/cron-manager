import path from "path";
import {Sequelize} from "sequelize";
import config from "./config.js";

export const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(config.path.storage, "cron-manager.db"),
    logging: false,
    define: {
        underscored: true,
        timestamps: false
    }
});
