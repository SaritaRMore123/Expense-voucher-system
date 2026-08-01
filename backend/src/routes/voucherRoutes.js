const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucherController");
const { authenticate, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.use(authenticate);

// Signature upload (employee uploading own, or director uploading approval signature)
router.post("/upload-signature", authorize("employee", "director"), upload.single("signature"), voucherController.uploadSignature);

// Employee routes
router.post("/", authorize("employee"), voucherController.createVoucher);
router.get("/mine", authorize("employee"), voucherController.getMyVouchers);
router.put("/:id", authorize("employee"), voucherController.updateVoucher);
router.delete("/:id", authorize("employee"), voucherController.deleteVoucher);
router.post("/:id/submit", authorize("employee"), voucherController.submitVoucher);

// Director routes
router.get("/pending", authorize("director"), voucherController.getPendingVouchers);
router.post("/:id/approve", authorize("director"), voucherController.approveVoucher);
router.post("/:id/reject", authorize("director"), voucherController.rejectVoucher);

// Director + Accounts: view all vouchers (search/filter/sort via query params)
router.get("/", authorize("director", "accounts"), voucherController.getAllVouchers);

// Any authenticated role can view a single voucher (ownership enforced in controller)
router.get("/:id", voucherController.getVoucherById);

module.exports = router;
