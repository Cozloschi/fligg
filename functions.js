
function clear_posts(rows,req,myId){
	for(var i = 0;i<= rows.length;i++)
		 {
			 if(rows[i] && rows[i].text){
			  //delete password
			  delete rows[i].password;
			  
			  
			  //check delete
			  if(rows[i].user_id == req.cookies.login_user)
			   rows[i].del = true;
			  else
			   rows[i].del = false;
			  
			  
			  //check if loved
			  if(rows[i].likes_id.search(','+myId) > -1)
			   rows[i].loved = 'loved';
			  else
			   rows[i].loved = '';
				 
				  if(rows[i].hashtags.length > 1 && rows[i].hashtags.search('#') > -1)
				  {
				  
				   //transform filed to array
				   rows[i].hashtags = rows[i].hashtags.split(',');
				   
				  }
				  else
				   rows[i].hashtags = []; //remove hashtags
				   
				   

			} 
		 }
		 
		 return rows;
}

exports.clear_posts = clear_posts;