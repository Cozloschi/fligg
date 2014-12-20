var express = require('express');
var url    = require('url');
var router = express.Router();

// connect to mysql

var functions = require('../functions.js');

var mysql = require('mysql');
var conn  = mysql.createConnection({
 host     : 'localhost',
 user     : 'root',
 password : '',
 database : 'quotes',
});

conn.connect(function(err){
 if(err)
   console.log(err); // log the error  
});

router.get('/:params',function(req,res){
  
  var url_parts = req.params.params.split('.');
  

   
  var query = "Select * from `users` left join `quotes` on users.user_id = quotes.user_id where users.user_id = '"+url_parts[2]+"' order by quotes.quote_id desc limit 5";
  var notifications = "Select * from `notifications` left join `users` on notifications.from = users.user_id left join `quotes` on quotes.quote_id = notifications.post_id where notifications.to = '"+req.cookies.login_user+"' order by IF(EXISTS(Select * from notifications where `to` = '"+req.cookies.login_user+"' and seen = 0),-notifications.seen,notifications.id) desc";
    
   
  
  var myId = req.cookies.login_user? req.cookies.login_user : 0;  
  
  conn.query(query,function(err,rows){
   //load notifications
	conn.query(notifications,function(err_notifications,rows_notifications){
	 
    console.log(err_notifications);

	//count the rows and limit to 5
    var number_of_not = rows_notifications.length;
	var unread = false;
	
	//check if exists unread notifications
	for(var i=0;i<=number_of_not;i++)
	 if(rows_notifications[i] && rows_notifications[i].seen == 0)
	 {
	  unread=true;
	  break;
	 }
    
    var rows_notifications = rows_notifications.slice(0,5);
		
	//render notifications
		
	    var notifications = [];
		for(var i = 0;i<=rows_notifications.length;i++)
		 {
		  if(rows_notifications[i])
		  {
		   var short_o = rows_notifications[i];
		   var array_obj = {};
			
		   if(short_o.type == 1)
		    {
			 array_obj.profile = "/profile/"+short_o['fname']+"."+short_o['sname']+"."+short_o['user_id'];
      		 array_obj.name    = short_o['fname']+" "+short_o['sname'];
 			 array_obj.text    = "loves your";
			 array_obj.post    = "/posts/"+short_o['post_id'];
			 array_obj.data    = short_o['data'];
		     array_obj.avatar  = "/../files/"+short_o['avatar'];
	         array_obj.id      = rows_notifications[i].id;
			 array_obj.quote   = rows_notifications[i].text;
		     array_obj.type    = 1;
			}
		 	else
			{
			 array_obj.profile = "/profile/"+short_o['fname']+"."+short_o['sname']+"."+short_o['user_id'];
      		 array_obj.name    = short_o['fname']+" "+short_o['sname'];
 			 array_obj.text    = "is following you";
			 array_obj.data    = short_o['data'];
		     array_obj.avatar  = "/../files/"+short_o['avatar'];
	         array_obj.id      = rows_notifications[i].id;
			 array_obj.type    = 2;
			}
			
		   notifications.push(array_obj);
		  }
		 }
	

    

	
	var seo_data= {title:url_parts[0]+" "+url_parts[1],
	               description:'Profiles page'};
	
    //other data
	var data = {following     :'follow',
	            following_text:'Follow',
				user_id       :url_parts[2],
				fname         :url_parts[0],
				sname         :url_parts[1]};
	
	if(rows[0])
	if(rows[0].followed.search(','+myId) > -1)
	{
	 data['following'] = 'follow following';
	 data['following_text'] = 'Following';
	}
	//parse rows
		
    console.log('before parse rows');
	
	rows = functions.clear_posts(rows,req,myId);

	
	//console.log(rows);
	
    if(req.cookies.login_data)	
     var cookies = JSON.parse(req.cookies.login_data);
	else
	 var cookies = {name:'not-logged-in'};
	
	
	//load followers and follwing number
	
	if(rows[0]){
	 var followers = rows[0].followed.split(',').length -1;
	 var following = rows[0].following.split(',').length -1;
	 var loves     = rows[0].loves;
	}
	
    if(!req.cookies.login_user || !req.cookies.login_data)
     var render_what = 'landing_page';
	else 
	 var render_what = 'profile';
      
    console.log(render_what);   
 
	
    res.render(render_what, {
	 
	  'posts':rows,
	  'seo'  :seo_data,
	  'data' :data,
	  'not'  :notifications,
	  'data_n': {number_notifications:number_of_not,
		         unread   : unread == true ? 'unread' : '',
				 password : cookies.password,
				 email    : cookies.email,
				 avatar   : cookies.avatar,
				 fname    : cookies.name.split(' ')[0],
				 sname    : cookies.name.split(' ')[1],
				 followed : followers,
				 following: following,
				 loves    : loves}
	});
    res.end();
	
	
	});
  });
  
 
  
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

});

module.exports = router;