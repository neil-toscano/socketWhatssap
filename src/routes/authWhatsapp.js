const {Router}=require('express');
const { authWebHook } = require('../controllers/whatsapp/whatsapp');

const router=Router();

router.get('',authWebHook);

module.exports = router