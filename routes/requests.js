var express = require('express');
var router = express.Router();
var fs     = require('fs');
var multipart = require('connect-multiparty');
var functions  = require('../functions.js');

var gm = require('gm').subClass({ imageMagick: true });;


//middleware
/*
router.use(function(req,res){
 if(!req.cookies.login_user && req.cookies.login_data){
 
   res.end(JSON.stringify({status:'no-login'}));

 } 
});

*/

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

var multipartn = multipart();

//load post
router.post('/',multipartn,function(req, res) {
   

    
	//get current data
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	var now  = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
	
	
	if(dd<10) {
		dd='0'+dd
	} 

	if(mm<10) {
		mm='0'+mm
	} 

	today = dd+'-'+mm+'-'+yyyy+' '+now;
	
	//set response headers
	res.setHeader('Content-Type', 'application/json');
	
	
	
	switch(req.body.action){
	
	
	 case 'report':
	  
	 //if user is logged in
	
	 if(req.cookies.login_user){
    
      var query = "Update `quotes` set reports = reports+1 , reports_id = CONCAT(reports_id,',"+req.cookies.login_user+"') where quote_id = '"+req.body.id+"' limit 1";
	  
	  
	  var query = conn.query(query,function(err,results){
	  
	   if(err == null)
	    res.write(JSON.stringify({'status':'ok'}));
	   else
	    res.write(JSON.stringify({'status':'error'}));
	  
  	   res.end();
	  });
	 
	 }
	 break;
	 
	 case 'love':
	 
	  //if user is logged in
	  if(req.cookies.login_user){
	  
	   var query = "Update `quotes`,`users` set users.loves = users.loves+1,quotes.likes = quotes.likes+1 , quotes.likes_id = CONCAT(quotes.likes_id,',"+req.cookies.login_user+"') where users.user_id = quotes.user_id and quotes.quote_id = '"+req.body.id+"'";
	   
	   conn.query(query,function(err,results){
	    
	   console.log(err);
		//add notification
		
		var not = {from   :req.cookies.login_user,
		           to     :req.body.user_id,
				   type   :1 ,
				   post_id:req.body.id,
				   data   :today};// liked
				   
				   
        var avatar  = JSON.parse(req.cookies.login_data).avatar;
		
		conn.query("Insert into `notifications` set ?",not,function(err,rows){
		
		 if(!err)
		  res.write(JSON.stringify({status:'done',user_id:req.cookies.login_user,today:today,not_id:rows.insertId,avatar:avatar}));
		 else
		  res.write(JSON.stringify({status:'error'}));
		 
		 res.end();
		 
		});
	   
	   });
	  
	  
	  }
	  
	 
	 break;
	
	 case 'unlove':
	 
	  //if user is logged in
	  if(req.cookies.login_user){
	  
	   var query = "Update `quotes`,`users` set users.loves = users.loves-1 ,quotes.likes = quotes.likes-1 , quotes.likes_id = REPLACE(quotes.likes_id,',"+req.cookies.login_user+"','') where quotes.quote_id = '"+req.body.id+"'";
	   
	   conn.query(query,function(err,results){
	    
	  	 if(err)
		  res.write(JSON.stringify({status:'done'}));
		 else
		  res.write(JSON.stringify({status:'error'}));
	   });
	  
	  
	  }
	  
	 
	 break;
	
	case 'add_post':
	 
	 if(req.cookies.login_user && req.cookies.login_data){
	 
	  req.cookies.login_data = JSON.parse(req.cookies.login_data);
	  
	  var obj = {text    :req.body.quote,
	             user_id :req.cookies.login_user,
				 hashtags:req.body.hashtags,
				 source  :req.body.author};
				 
	  conn.query("Insert into `quotes` set ?",obj,function(err,rows){
	  
	   
	   if(!err)
	    res.write(JSON.stringify({status:'ok',user_data:{name:req.cookies.login_data.name,id:req.cookies.login_user,id:req.cookies.login_user},insert_id:rows.insertId}));
	   else 
		res.write(JSON.stringify({status:'error'}))
	   
        res.end();	   
	  
	  });
	 
	 }
	
	break;
	
	
	case 'follow':
	 
	 if(req.cookies.login_user && req.cookies.login_data){
	 
 	  var myId = req.cookies.login_user;
	  
	  var follow = req.body.who;
	  
	  var QueryString = "Update users set followed = CONCAT(followed,',"+myId+"') where user_id = '"+follow+"' limit 1";
	  
	  conn.query(QueryString,function(err1,rows){
	   
	   var SecondQuery = "Update users set following = CONCAT(following,',"+follow+"') where user_id = '"+myId+"' limit 1";
	   
	   conn.query(SecondQuery,function(err,rows){
	    		
		var fol = {from   :req.cookies.login_user,
		           to     :follow,
				   type   :2 ,
				   data   :today};
				   
	    conn.query("Insert into notifications set ?",fol,function(err2,rows_not){
		

		
		 if(!err1 && !err && !err2)
		 {
		  res.write(JSON.stringify({'status':'ok','not_id':rows_not.insertId}));
		  res.end();
		 }
		 else
		 {
		  res.write(JSON.stringify({'status':'error'}));
		  res.end();
		 }
		 
	    });
		
	   });
	  
	  });
	 
	 }
	 else
	  res.end(JSON.stringify({'status':'login-error'}));
	  
	break;	
	
	case 'unfollow':
	 
	 if(req.cookies.login_user && req.cookies.login_data){
	 
 	  var myId = req.cookies.login_user;
	  
	  var follow = req.body.who;
	  
	  var QueryString = "Update users set followed = REPLACE(followed,',"+myId+"','') where user_id = '"+follow+"' limit 1";
	  
	  conn.query(QueryString,function(err1,rows){
	   
	   var SecondQuery = "Update users set following = REPLACE(following,',"+follow+"','') where user_id = '"+myId+"' limit 1";
	   
	   conn.query(SecondQuery,function(err,rows){
	    
	    
		 if(!err1 && !err)
		 {
		  res.write(JSON.stringify({'status':'ok'}));
		  res.end();
		 }
		 else
		 {
		  res.write(JSON.stringify({'status':'error'}));
		  res.end();
		 }
	   
	   });
	  
	  });
	 
	 }
	 else
	  res.end(JSON.stringify({'status':'login-error'}));
	  
	break;
	
	
	case 'unread_clear':
	 
	 if(req.cookies.login_user){
	 
	  var array_parsed = JSON.parse(req.body.data);
	  
	
	  
	  
	  //create the list
	  var list = '';
	  for(var i=0;i<=array_parsed.length;i++)
	   if(array_parsed[i])
	    list += list == ''? array_parsed[i] : ','+array_parsed[i];
	  
	  var my_id = req.cookies.login_user;
	  

	  
	  var QueryString = "Update notifications set seen = '1' where `to` = '"+my_id+"' and id IN ("+list+") limit "+array_parsed.length;
	  
	  conn.query(QueryString,function(err,rows){
	  
       console.log(QueryString);
	   console.log(err);
	   if(err)
	    res.write(JSON.stringify({status:'error'}));
	   else 
		res.write(JSON.stringify({status:'done'}));
		
	   
	    res.end();
	  
	  });
	 }
	
	break;
	
	
	case 'register':
	 
	 var obj = req.body;
	 
	 //remove 'action' item from req params
	 delete obj.action;

	
	
	 conn.query("Insert into users(email,fname,sname,password,avatar) values('"+obj.email+"','"+obj.fname+"','"+obj.sname+"','"+obj.password+"','default.jpg')",function(err,rows){
	  if(err)
	   res.end(JSON.stringify({status:'error'}));
	  else{
	    
	   //log in 
	   	var login_obj = {name:obj.fname+' '+obj.sname,email:obj.email,password:obj.password,avatar:'default.jpg'};
		res.cookie('login_user', rows.user_id ,{maxAge:3600000,path: '/'});
		res.cookie('login_data', JSON.stringify(login_obj),{maxAge:3600000,path: '/'});
	   
	   res.end(JSON.stringify({status:'done',id:rows.insertId}));
	  
	  }
	 });
	
	
	break;
 
    case 'login':
	
	 var obj = req.body;

	 var query = "Select * from users where email = '"+obj.email+"' and password = '"+obj.password+"' limit 1";
	 
	 conn.query(query,function(err,rows){
	 
	 
	 
	  if(err && rows.length == 0){
	   res.end(JSON.stringify({status:'error'}));
	  }
	  else
	  {
	   if(rows.length > 0)
	   {
	    rows = rows[0];
		
	  	   //log in 
	   	var login_obj = {name:rows.fname+' '+rows.sname,email:rows.email,password:rows.password,avatar:rows.avatar};
        
		console.log(login_obj);
		
		res.cookie('login_user', rows.user_id ,{maxAge:3600000,path: '/'});
		res.cookie('login_data', JSON.stringify(login_obj),{maxAge:3600000,path: '/'});
	   
	   res.end(JSON.stringify({status:'done',id:rows.user_id}));
	  
	  }
	  else
	   res.end(JSON.stringify({status:'invalid'}));
	 }

	 
	 });
	
	
	break;
	
	
	case 'settings':
	
	 if(req.cookies.login_user){
	 
	  var cookies = JSON.parse(req.cookies.login_data);
	  
	  if(cookies.email != req.body.email){ //if email changed, check if the new one is not already taken
	   
	   conn.query("Select * from users where email = '"+req.body.email+"' limit 1",function(err,rows){
	   
	    if(rows.length == 1)
		 res.end(JSON.stringify({status:'email_took'}));
		else{
		 
		 conn.query("Update users set fname = '"+req.body.fname+"', sname = '"+req.body.sname+"' ,avatar = '"+req.body.avatar+"' ,email = '"+req.body.email+"',password = '"+req.body.password+"' where user_id = '"+req.cookies.login_user+"' limit 1",function(err,rows){
	      
		  cookies.email    = req.body.email;
          cookies.password = req.body.password;
		  cookies.avatar   = req.body.avatar;
		  cookies.sname    = req.body.sname;
		  cookies.fname    = req.body.fname;
		   
		  var saved_id = req.cookies.login_user; 
		  //clear cookies
		  res.clearCookie('login_user');
		  res.clearCookie('login_data');
		  
		  res.cookie('login_data', JSON.stringify(cookies),{maxAge:3600000,path: '/'});
		  res.cookie('login_user', saved_id,{maxAge:3600000,path: '/'});
          
		  
		  
		  if(!err)
           res.end(JSON.stringify({status:'done'}));
		  else
		   res.end(JSON.stringify({status:'error'}));
		 });
		
		}
	   
	   });
	   
	  }else{//update only password
	     
		 conn.query("Update users set avatar= '"+req.body.avatar+"' ,password = '"+req.body.password+"' where user_id = '"+req.cookies.login_user+"' limit 1",function(err,rows){
	      
		  cookies.email = req.body.email;
          cookies.password = req.body.password;
		  cookies.avatar   = req.body.avatar;
		  
		  req.cookies.login_data = JSON.stringify(cookies);
		  
		  
		  var saved_id = req.cookies.login_user;
		  //clear cookies
		  res.clearCookie('login_user');
		  res.clearCookie('login_data');
		  
		  res.cookie('login_data', JSON.stringify(cookies),{maxAge:3600000,path: '/'});
		  res.cookie('login_user', saved_id,{maxAge:3600000,path: '/'});
          

		  
		  
		  if(!err)
           res.end(JSON.stringify({status:'done'}));
		  else
		   res.end(JSON.stringify({status:'error'}));
		 });
	  
	  
	  }
	 
	 
	 }
	
	
	
	break;
	
	
	case 'upload_img':
		
		
		if(req.cookies.login_user){
		
		var new_name = (new Date()/1000) + '.' + req.files.thumbnail.name.split('.')[req.files.thumbnail.name.split('.').length-1];
		
		
			// get the temporary location of the file
			var tmp_path = req.files.thumbnail.path;
			// set where the file should actually exists - in this case it is in the "images" directory
			var target_path = __dirname+'/../public/avatars/' + new_name;
			
			// move the file from the temporary location to the intended location
			fs.rename(tmp_path, target_path, function(err) {
				if (err) throw err;
				// delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
				fs.unlink(tmp_path, function() {
					if (err) throw err;
					else
					{
					 //add date to database
					 
					 conn.query("Update users set avatar = '"+new_name+"' where user_id = '"+req.cookies.login_user+"' limit 1",function(err,rows){
					  
					  
					  var cookie  = JSON.parse(req.cookies.login_data);
					  var saved_id= req.cookies.login_user;
					  
					  //resize
					  
						gm(target_path).resize(353, 257)
						.autoOrient()
						.write(target_path, function (err) {
							if (!err) console.log(' hooray! ');
						    else
							console.log(err);
						});
					  
					  //reset cookies
					  //clear cookies
					  res.clearCookie('login_user');
					  res.clearCookie('login_data');
					  
					  
					  if(fs.existsSync(__dirname+'/../public/avatars/'+cookie.avatar)){
					   
					    fs.unlink(__dirname+'/../public/avatars/'+cookie.avatar);
					  
					  }
					  
					  cookie.avatar = new_name;
					  
					  res.cookie('login_data', JSON.stringify(cookie),{maxAge:3600000,path: '/'});
					  res.cookie('login_user', saved_id,{maxAge:3600000,path: '/'});
					 
					 console.log(cookie);
					 
					
					   res.setHeader('Content-Type', 'text/HTML');
					  
					 
					    
						  if(!err)
						   res.end('<script type="text/javascript">parent.done_image("'+new_name+'");</script>');
						  else
						   console.log(err);
						 
	                 
					 
					 
					
					 });
					 
					
				    }
				});
			});
		
	   }
	
	break;
	
	
	case 'logout':
	
	 res.clearCookie('login_user');
     res.clearCookie('login_data');
	 
	 res.end(JSON.stringify({status:'ok'}));
	 
	 
	break;
	
	case 'delete_post':
	 
	 if(req.cookies.login_user && req.cookies.login_data){
	 
	 
	  var Query = "Delete from quotes where quote_id = '"+req.body.id+"' and user_id = '"+req.cookies.login_user+"' limit 1";
	 
	  conn.query(Query,function(err,rows){
	   
	   
	   if(!err)
	    res.end(JSON.stringify({status:'ok'}));
	   else
	    res.end(JSON.stringify({status:'error'}));
	  
	  });
	 
	 }
	 
	
	break;
 
 } 
   
 });
 
 //load get
 
 router.get('/',function(req,res){
  	//set response headers
    

 
    switch(req.query.action){
	
	 case 'load_more':
	  
	  if(req.query.cases == 'index') 
       var Query = "Select * from `quotes` left join `users` on quotes.user_id = users.user_id where quotes.reports_id NOT LIKE '%,"+req.cookies.login_user+"%' order by quotes.quote_id desc limit "+req.query.number+",10"; 
      
	  if(req.query.cases == 'profile')
       var Query = "Select * from `quotes` left join `users` on quotes.user_id = users.user_id where quotes.reports_id NOT LIKE '%,"+req.cookies.login_user+"%' and users.user_id = '"+req.query.key+"' order by quotes.quote_id desc limit "+req.query.number+",10"; 
      
	  if(req.query.cases == 'hashtag')
	   var Query = "Select * from `quotes` left join `users` on quotes.user_id = users.user_id where quotes.reports_id NOT LIKE '%,"+req.cookies.login_user+"%' and quotes.hashtags LIKE '"+req.query.key+"%' order by quotes.quote_id desc limit "+req.query.number+",10"; 
      
	  if(req.query.cases == 'search')
	   var Query = "Select * from `quotes` left join `users` on quotes.user_id = users.user_id where quotes.reports_id NOT LIKE '%,"+req.cookies.login_user+"%' and quotes.text LIKE '%"+req.query.key+"%' order by quotes.quote_id desc limit "+req.query.number+",10"; 
      
	  if(req.query.cases == 'index_top')
	   var Query = "Select * from `quotes` left join `users` on quotes.user_id = users.user_id where quotes.reports_id NOT LIKE '%,"+req.cookies.login_user+"%'  order by quotes.likes desc limit "+req.query.number+",10"; 
      

	  
      conn.query(Query,function(err,rows,fields){
       
	   console.log(err);
	   
	   if(rows)
	   {
	    for(var i = 0;i<=rows.length;i++)
         if(rows[i])
		 {
		 
          if(rows[i].likes_id.search(','+req.cookies.login_user) > -1)
		   rows[i].loved = 'loved';
		   
		   
		  
		  //make changes for showing
		   delete rows[i].password; 
		   
           rows[i].id        = rows[i].quote_id;
		   rows[i].user_name = rows[i].fname+' '+rows[i].sname;
	
		 
		 }		 
	   }
	   
	
	   if(!err)
	    res.write(JSON.stringify({status:'ok',data:rows}));
	   else
	   {
	    console.log(err);
		res.write(JSON.stringify({status:'error'}));
       }
  	   res.end();
	
	  });	  
	  
	 break;
	 
	case 'search':
         
		 
      var userId = req.cookies.login_user ? req.cookies.login_user : 0;		 
	  
	  if(req.query.type == false)
	   var QueryString = "Select * from `quotes` left join `users` on users.user_id = quotes.user_id where quotes.text like '%"+req.query.key+"%' and quotes.reports_id NOT LIKE '%"+userId+"%' limit 10";
	  else 
	   var QueryString = "Select * from `quotes` left join `users` on users.user_id = quotes.user_id where quotes.hashtags like '%"+req.query.key+"%' and quotes.reports_id NOT LIKE '%"+userId+"%' limit 10";
	  
	  conn.query(QueryString,function(err,rows){
	   
	   if(!rows) rows = {};

	   
	   
	   //make changes
	   for(var i = 0;i<= rows.length;i++)
		 {
			 if(rows[i] && rows[i].text){
			 
			 
	          //delete password
		      delete rows[i].password;			  

			
			  //check if loved
			  if(rows[i].likes_id.search(','+userId) > -1)
			   rows[i].loved = 'loved';
			  else
			   rows[i].loved = '';
				 
				  if(rows[i].hashtags.search(',') > -1)
				  {
				   //transform filed to array
				   rows[i].hashtags = rows[i].hashtags.split(',');
				  }
			} 
		 }
	   
	   res.write(JSON.stringify(rows));
	  
	   res.end();
	  });
	  
	break;
	
	case 'new_posts':
	
	
 	 if(req.cookies.login_user){
	
	  var queryString = "Select * from `quotes` left join `users` on quotes.user_id = users.user_id where quotes.reports_id NOT LIKE '%,"+req.cookies.login_user+"%' and quotes.quote_id > '"+req.query.id+"'  order by quotes.quote_id desc limit 5"; 
       
	  conn.query(queryString,function(err,rows){
	    
		if(err){
		 res.write('error');
		 res.end();
		}
		else
		{
		 res.write(JSON.stringify(rows));
	     res.end();
	    }
	  });
	
	}
	break;
	
	
	case 'notification_page':
	

	  var action  = req.query.what;
	  
	  //by IF(EXISTS(Select * from notifications where `to` = '"+req.cookies.login_user+"' and seen = 0),-notifications.seen,notifications.id)
	  
	  var limit = req.query.page * 5 -5;
	  
	  console.log(req.query.page);

	  var notifications = "Select * from `notifications` left join `users` on notifications.from = users.user_id left join `quotes` on quotes.quote_id = notifications.post_id where notifications.to = '"+req.cookies.login_user+"' order by id desc  limit "+limit+",5";
    

	 
	 conn.query(notifications,function(err,rows_notifications){
	 
	   //console.log(rows_notifications.length);
	    var notifications = [];
	   
	  // if(action == 'next') //orde notifications
	    for(var i = rows_notifications.length;i>=0;i--)//desc
		{
         if(rows_notifications[i])
		 {
	       var short_o = rows_notifications[i];
		   var array_obj = {};
			
		   if(short_o.type == 1)
		    {
			 array_obj.profile = "/profile/"+short_o['fname']+"."+short_o['sname']+"."+short_o['user_id'];
      		 array_obj.name    = short_o['fname']+" "+short_o['sname'];
 			 array_obj.post    = "/posts/"+short_o['post_id'];
			 array_obj.data    = short_o['data'];
		     array_obj.avatar  = short_o['avatar']; //it alldready has '/../files' before
	         array_obj.not_id  = rows_notifications[i].id;
			 array_obj.text    = rows_notifications[i].text;
		     array_obj.type    = 1;
			 array_obj.seen    = rows_notifications[i].seen;
			}
			else
			{
			 array_obj.profile = "/profile/"+short_o['fname']+"."+short_o['sname']+"."+short_o['from'];
      		 array_obj.name    = short_o['fname']+" "+short_o['sname'];
 			 array_obj.text    = "is following you";
			 array_obj.data    = short_o['data'];
		     array_obj.avatar  = short_o['avatar'];//it alldready has '/../files' before
	         array_obj.not_id  = rows_notifications[i].id;
			 array_obj.type    = 2;
			 array_obj.seen    = rows_notifications[i].seen;
			}
		 
		   notifications.push(array_obj);
		   
		   
		}
	  }
	 /* else //asc
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
 			 array_obj.post    = "/posts/"+short_o['post_id'];
			 array_obj.data    = short_o['data'];
		     array_obj.avatar  = short_o['avatar']; //it alldready has '/../files' before
	         array_obj.not_id  = rows_notifications[i].id;
			 array_obj.text    = rows_notifications[i].text;
		     array_obj.type    = 1;
			 array_obj.seen    = rows_notifications[i].seen;
			}
			else
			{
			 array_obj.profile = "/profile/"+short_o['fname']+"."+short_o['sname']+"."+short_o['from'];
      		 array_obj.name    = short_o['fname']+" "+short_o['sname'];
 			 array_obj.text    = "is following you";
			 array_obj.data    = short_o['data'];
		     array_obj.avatar  = short_o['avatar'];//it alldready has '/../files' before
	         array_obj.not_id  = rows_notifications[i].id;
			 array_obj.type    = 2;
			 array_obj.seen    = rows_notifications[i].seen;
			}
		 
		   notifications.push(array_obj);
		   
		   
		}
	  }
	 */
	  if(!err)
	    res.end(JSON.stringify({'status':'ok','rows':notifications}));
	   else
	   {
	   	console.log(error);
		res.end(JSON.stringify({'status':'error'}));

	   }
	   
	   
	 });
	
	break;
	
	
	case 'index_frame':

	 switch(req.query.what){
	  
	   case 'news':
	   
	    var Query = "Select * from `quotes` left join `users` on quotes.user_id = users.user_id where quotes.reports_id NOT LIKE '%,"+req.cookies.login_user+"%' order by quotes.quote_id desc limit 5"; 
   
	   break;
	   
	   case 'top':
	    
		var Query = "Select * from `quotes` left join `users` on quotes.user_id = users.user_id where quotes.reports_id NOT LIKE '%,"+req.cookies.login_user+"%'  order by quotes.likes desc limit 5"; 
      
	  }
		 
		
		
	  conn.query(Query,function(err,rows){
		
		 rows = functions.clear_posts(rows,req,req.cookies.login_user);
		 
		 if(!err)
		  res.send(JSON.stringify({data:rows,status:'ok'}));
		 else
		  res.send(JSON.stringify({status:'error'}));
		
 		 res.end();
		 
	  });
		
	   

	
	
	
	break;
	
	
	}
 
 });
 

 

   


module.exports = router;
