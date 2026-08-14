import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import authRouter from "./auth";
import uploadRouter from "./upload";
import contactRouter from "./contact";

const router: IRouter = Router();

router.use(healthRouter);
router.use(propertiesRouter);
router.use(authRouter);
router.use(uploadRouter);
router.use(contactRouter);

export default router;
