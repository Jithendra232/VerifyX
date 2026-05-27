const express = require("express");
const protectRoute = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  getManufacturerDashboard,
  getDistributorDashboard,
  getRetailerDashboard,
  getCustomerDashboard,
  getAdminDashboard,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get(
  "/manufacturer",
  protectRoute,
  authorizeRoles("manufacturer"),
  getManufacturerDashboard
);

router.get(
  "/distributor",
  protectRoute,
  authorizeRoles("distributor"),
  getDistributorDashboard
);

router.get(
  "/retailer",
  protectRoute,
  authorizeRoles("retailer"),
  getRetailerDashboard
);

router.get(
  "/customer",
  protectRoute,
  authorizeRoles("customer"),
  getCustomerDashboard
);

router.get(
  "/admin",
  protectRoute,
  authorizeRoles("admin"),
  getAdminDashboard
);

module.exports = router;
