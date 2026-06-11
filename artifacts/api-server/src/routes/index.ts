import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leaguesRouter from "./leagues";
import teamsRouter from "./teams";
import playersRouter from "./players";
import picksRouter from "./picks";
import draftRouter from "./draft";
import leagueSummaryRouter from "./league_summary";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leaguesRouter);
router.use(teamsRouter);
router.use(playersRouter);
router.use(picksRouter);
router.use(draftRouter);
router.use(leagueSummaryRouter);

export default router;
