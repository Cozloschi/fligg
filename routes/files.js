var express = require('express');
var router = express.Router();
var path  = require('path');



router.get('/:file', function(req, res){
    var file = req.params.file;
        
	 res.sendFile(path.join(__dirname, '../public/avatars', file));
		
     
});


module.exports = router;