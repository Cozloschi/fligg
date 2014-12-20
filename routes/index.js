var express = require('express');
var functions = require('../functions.js');
var router = express.Router();



// connect to mysql

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


/* GET home page. */
router.get('/', function(req, res) {

		
    var seo_data = {title      :'First page',
					description:'My page description'}  
						
  console.log(req.cookies);
 //add cookie
 		//login user
/*
		var login_obj = {name:'Cozloschi Florin'};
		if(!req.cookies.login_user)
		res.cookie('login_user', '1',{maxAge:3600000,path: '/'});
		if(!req.cookies.login_data)
		res.cookie('login_data', JSON.stringify(login_obj),{maxAge:3600000,path: '/'});
*/
 
 //for landing page

//res.clearCookie('login_user');
//res.clearCookie('login_data');
 //if user is logged in
  if(req.cookies.login_user){
 
   var queryString = "Select * from `quotes` left join `users` on quotes.user_id = users.user_id where quotes.reports_id NOT LIKE '%,"+req.cookies.login_user+"%' order by quotes.quote_id desc limit 5"; 
   
   //IF(EXISTS(Select * from notifications where `to` = '"+req.cookies.login_user+"' and seen = 0),-notifications.seen,notifications.id)
   
   var notifications = "Select * from `notifications` left join `users` on notifications.from = users.user_id left join `quotes` on quotes.quote_id = notifications.post_id where notifications.to = '"+req.cookies.login_user+"' order by id desc";
    
    
   var myId = req.cookies.login_user? req.cookies.login_user : 0;  
 
   conn.query(queryString,function(err,rows,fields){//load user data
   
   	   
	if(!rows) rows = {};

   
    //load notifications
	conn.query(notifications,function(err_notifications,rows_notifications){
	 

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
			 array_obj.seen    = rows_notifications[i].seen == 1 ? '' : 'unseen';
			}
			else
			{
			 array_obj.profile = "/profile/"+short_o['fname']+"."+short_o['sname']+"."+short_o['from'];
      		 array_obj.name    = short_o['fname']+" "+short_o['sname'];
 			 array_obj.text    = "is following you";
			 array_obj.data    = short_o['data'];
		     array_obj.avatar  = "/../files/"+short_o['avatar'];
	         array_obj.id      = rows_notifications[i].id;
			 array_obj.type    = 2;
			 array_obj.seen    = rows_notifications[i].seen == 1 ? '' : 'unseen';
			}
		 
		   notifications.push(array_obj);
		  }
		 }
	
        // console.log(array_obj);
		//parse rows
		
		rows = functions.clear_posts(rows,req,myId);
      

        var cookies = JSON.parse(req.cookies.login_data);
		
		
		console.log(cookies.length);
		
		res.render('index', {
		 
		  'posts':rows,
		  'seo'  :seo_data,
		  'not'  :notifications,
		  'data' : {number_notifications:number_of_not,
		            unread: unread == true ? 'unread' : '',
					password: cookies.password,
					email   : cookies.email,
					avatar  : cookies.avatar,
					fname   : cookies.name.split(' ')[0],
					sname   : cookies.name.split(' ')[1],
					l_more  : true,
					logged  : cookies.length == 0 ? 0 : 1}
		
		});
		

		
		res.end();
	
	
	});
   
   });
	
  }
  else //landing page
  {
  

   
   	res.render('landing_page',{seo:seo_data});
		

		
	res.end();
	
  }
   
  
 });


module.exports = router;
