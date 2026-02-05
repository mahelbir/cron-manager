import {DataTypes} from "sequelize";
import path from "path";
import fs from "fs/promises";
import {sequelize} from "../config/database.js";
import {BaseModel} from "./base-model.js";
import {moment} from "../config/packages.js";
import config from "../config/config.js";

export default class Job extends BaseModel {

    getCacheFilePath() {
        return path.join(config.path.cache, "job_" + this.id + ".cache");
    }

    async getLastRunAt() {
        try {
            const stats = await fs.stat(this.getCacheFilePath());
            return moment(stats.mtime).unix();
        } catch {
            return 0;
        }
    }

    async updateLastRunAt() {
        const filePath = this.getCacheFilePath();
        const now = moment().unix();
        try {
            await fs.utimes(filePath, now, now);
            return now;
        } catch {
            try {
                await fs.writeFile(filePath, "");
                return now;
            } catch {
                return false;
            }
        }
    }

    async deleteCache() {
        try {
            await fs.unlink(this.getCacheFilePath());
            return true;
        } catch {
            return false;
        }
    }

}

Job.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    tag: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null
    },
    interval: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    concurrent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    method: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: "GET"
    },
    options: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        get() {
            const val = this.getDataValue("options");
            try {
                return JSON.parse(val);
            } catch {
                return {};
            }
        },
        set(val) {
            if (val) {
                this.setDataValue("options", JSON.stringify(val));
            } else {
                this.setDataValue("options", null);
            }
        }
    },
    response: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
        get() {
            const val = this.getDataValue("response");
            try {
                return JSON.parse(val);
            } catch {
                return {check: null, interval: 0};
            }
        },
        set(val) {
            if (val) {
                this.setDataValue("response", JSON.stringify(val));
            } else {
                this.setDataValue("response", null);
            }
        }
    }
}, {
    sequelize,
    tableName: "jobs"
});
