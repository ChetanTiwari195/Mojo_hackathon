import { Router } from "express";
const router = Router();
import {userRegister} from "../controllers/user.controller.js"

router.route("/register",userRegister);

export default router;