const express = require('express')
const {checkout} = require('../controller/orderController')


const router = express.Router()

router.post('/checkout', checkout)




module.exports = router