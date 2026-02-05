import scripter from "../config/scripter.js";

export default (app) => {
    for (let i = 0; i < scripter.length; i++) {
        const {script, args} = scripter[i];
        script(app, ...args)
            .then(() => {
            })
            .catch(e => console.error(`script.${i}`, e));
    }
}