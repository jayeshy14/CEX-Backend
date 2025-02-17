const withdrawalController = require("../controllers/withdrawalController");
const router = require("express").Router();


router
    .post("/withdraw", withdrawalController.handleWithdrawal);



module.exports = router;