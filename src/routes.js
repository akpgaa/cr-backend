const { Router } = require('express');

const cmsContent = require('./api/crContent/cr.routes');

const router = Router();

router.get('/', (req, res) => {
  res.statusCode = 302;

  res.setHeader('Location', 'google.com');
  res.send("HELLO")
  res.end();
});


router.use('/cr', cmsContent);

module.exports = router;
