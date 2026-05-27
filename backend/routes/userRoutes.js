const express = require("express");

const router = express.Router();

const {
    syncUser,
    updateUserRole,
  } = require("../controllers/userController");

router.post("/sync", syncUser);
router.put("/role", updateUserRole);
module.exports = router;