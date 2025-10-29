const express = require('express')
const {checkout, getOrdersByEmail, getAllOrders, updateOrderStatus, getPendingDeliveries} = require('../controller/orderController')
const { checkUserByEmail } = require('../middleware/checkUserEmail')
const { protect, adminOnly } = require("../middleware/authMiddleware");


const router = express.Router()

router.post('/checkout', checkout)
router.get("/all-orders", protect, adminOnly, getAllOrders)


router.get('/pending-deliveries/:email', checkUserByEmail, getPendingDeliveries);
router.get("/:email", checkUserByEmail, getOrdersByEmail)

router.put("/:id", protect, adminOnly, updateOrderStatus)





module.exports = router