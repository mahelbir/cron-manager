import jwt from 'jsonwebtoken';
import config from "../config/config.js";
import {newRoute} from "../core/router.js";


const router = await newRoute("/api/auth");
const SSO_URL = config.env.SSO_URL;
const SSO_CLIENT_ID = config.env.SSO_CLIENT_ID;
const SSO_CLIENT_SECRET = config.env.SSO_CLIENT_SECRET;
const isSsoEnabled = config.env.SSO_ENABLED === 'true';
const isPasswordEnabled = config.env.PASSWORD_ENABLED === 'true';

router.post("/methods", async (req, res) => {
    let url;
    if (isSsoEnabled) {
        url = new URL(SSO_URL);
        url.pathname = "/auth/login/" + SSO_CLIENT_ID;
        url.searchParams.append("redirectUri", config.env.BASE_URL + "/api/auth/sso");
        url.searchParams.append("state", req.body.state || "/");
        url = url.toString();
    }
    return res.json({
        sso: {
            redirect: url
        },
        password: isPasswordEnabled
    });
});

router.post("/login", async (req, res, next) => {
    if (!isPasswordEnabled) {
        return res.status(400).json({
            error: "Login disabled"
        });
    }

    if (req.body.password.toString() === config.env.PASSWORD.toString())
        return res.json({
            token: jwt.sign({}, config.env.SECRET_KEY, {
                expiresIn: "7d"
            })
        });

    return res.status(400).json({
        error: "Login failed!"
    })
});

router.get("/sso", async (req, res) => {
    if (!isSsoEnabled) {
        return res.status(400).json({
            error: "Login disabled"
        });
    }

    req.acceptJSON = true;
    const token = req.query.token;
    if (!token) {
        return res
            .status(400)
            .send({error: "Missing token"});
    }
    try {
        jwt.verify(
            token,
            SSO_CLIENT_SECRET,
            {
                audience: new URL(config.env.BASE_URL).hostname
            }
        );
        const url = new URL(req.query.state);
        url.searchParams.append("authToken", jwt.sign({}, config.env.SECRET_KEY, {
            expiresIn: "7d"
        }));
        return res.redirect(url.toString());
    } catch (error) {
        return res
            .status(401)
            .send({error: "Authentication failed"});
    }
});

router.get("/logout", (req, res) => {
    const ref = req.get('referer') || "";
    if (isSsoEnabled) {
        const url = new URL(SSO_URL);
        url.pathname = "/auth/logout/" + SSO_CLIENT_ID;
        url.searchParams.append("redirect", req.get('referer') || "");
        return res.redirect(url.toString());
    }

    return res.redirect(ref);
});