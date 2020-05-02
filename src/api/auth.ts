import * as express from "express";
import { Router, Response, Request, NextFunction } from "express";
import UserDB from "../core/userDB";
import { SHA3 } from "sha3";
class AuthRouter {
  public router: Router;
  logged_in_users: Map<string, object>;
  constructor() {
    this.router = express.Router();
  }
  
  parseCookieString(cookies: String) {
    let cookiedictionary = {};
    console.log(cookies);
    if (cookies) {
      cookies.split(";").forEach(cookie => {
        let keyvalue = cookie.split("=");
        let key = keyvalue[0].trim();
        let value = keyvalue[1].trim();
        cookiedictionary[key] = value;
      });
    }
    return cookiedictionary;
  }
  public async routes() {
    this.router.delete(
      "/session",
      (req: Request, res: Response, next: NextFunction) => {
        let cookies = authRouter.parseCookieString(req.headers.cookie);
        if (cookies["session"]) {
          let sessID = cookies["session"];
          UserDB.delete(sessID);
          res.cookie("session", "", { maxAge: -1000 }).status(200).send("logged out");
        } else {
          res.status(400);
          res.send("session not provided");
        }
      }
    );
    this.router.use(function(req: any, res, next) {
      if (req.headers.cookie) {
        var cookies = authRouter.parseCookieString(req.headers.cookie);
        if (cookies["session"]) {
          let session = UserDB.get(cookies["session"]);
          if (session && session.exp > Date.now() && session.ip == req.ip) {
            res.status(200);
            console.log("session found");
            var sessID = cookies["session"];
            UserDB.updateExp(sessID, Date.now() + 1000 * 60 * 60 + 8);
            res.cookie("session", sessID, {
              maxAge: UserDB.get(sessID).exp - Date.now()
            });
            next();
            return;
          } else {
            console.log("deleting session coookie");
            res.cookie("session", "", { maxAge: -1000 }).status(401);
          }
        }
      }
      var nodeSSPI = require("node-sspi");
      var nodeSSPIObj = new nodeSSPI({
        authoritative: true,
        perRequestAuth: true
      });
      nodeSSPIObj.authenticate(req, res, function(err) {
        if (err) {
          console.log("error during auth");
          res.status(401);
        } else if (
          !req.headers["authorization"] ||
          req.headers.authorization.indexOf("TlRMTVNTUAAD") != -1
        ) {
          console.log("auth res; user:" + req.connection.user);
          if (req.connection.user) {
            let data = {
              user: req.connection.user,
              iat: Date.now(),
              ip: req.ip,
              exp: Date.now() + 1000 * 60 * 60 * 8
            };
            let sessID = new SHA3(512)
              .update(JSON.stringify(data))
              .digest("hex");
            UserDB.set(sessID, data);
            console.log(UserDB.get(sessID));
            res.cookie("session", sessID, {
              maxAge: UserDB.get(sessID).exp - Date.now()
            });
            res.status(200);
            next();
          }
        } else if (req.headers.authorization.indexOf("TlRMTVNTUAAB") != -1) {
          console.log("auth req");
          res.status(401);
        }
      });
    });
  }
}

const authRouter = new AuthRouter();
authRouter.routes();

export default authRouter.router;
