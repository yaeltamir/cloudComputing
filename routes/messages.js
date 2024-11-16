
const express = require("express");
const router = express.Router();

const usersController = require("../controllers/userController");

router.get("/",(req, res) => {
  const userId  = req.session.user.id;

  res.render("messages", { 
                          userId,
                          isRegistered:req.session.user.isRegistered});
                        }
  );

router.get("/subscribe/:answer", usersController.reverseSubscribtion);

module.exports = router;







