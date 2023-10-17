const {Router}=require('express');
const { authMessengerHook } = require('../controllers/messenger/messenger');

const router=Router();

router.get('',authMessengerHook);

module.exports = router