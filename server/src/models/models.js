import {sequelize} from "../config/database.js";

sequelize.authenticate().then(async () => {
    const result = await sequelize.query('SELECT sqlite_version() AS version');
    console.info('Database: SQLite ', (result?.[0]?.[0]?.version ?? "Unknown"));
    await sequelize.sync();
}).catch((e) => {
    console.error('Unable to connect to the database:', e.message);
});


export default (app) => {

};