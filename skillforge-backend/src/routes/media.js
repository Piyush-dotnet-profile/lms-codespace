import express from "express";
const router = express.Router();

router.get("/drive/:fileId", (req, res) => {
  res.send("media route works");
});

export default router;
