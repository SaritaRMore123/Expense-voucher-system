const { VoucherHistory } = require("../models");

async function logHistory({ voucherId, action, fromStatus, toStatus, user, remarks }) {
  await VoucherHistory.create({
    voucherId,
    action,
    fromStatus: fromStatus || null,
    toStatus: toStatus || null,
    performedByUserId: user.id,
    performedByName: user.name,
    performedByRole: user.role,
    remarks: remarks || null,
  });
}

module.exports = logHistory;
