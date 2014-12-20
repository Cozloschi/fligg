$(document).ready(function()
{

  $('html').niceScroll();
  
  $('div.center_add.sett_add').niceScroll();
  
  
  
 
  $('div.center_add.sett_add').mouseover(function(){
   
   $(this).getNiceScroll().resize();
 
  });
    
  //page notification
  var page_not = 1;
 
  var socket = io.connect('http://localhost:3700');
  
  socket.emit('connected',{id:cookie('login_user')});
  
  
  socket.on('loved',function(data){
   
   data = data.data;
   
   console.log(data);
   //prepend to
   
   if(page_not == 1) //append if it's first page of notifications
    append_notification(data);
   
  });  
  
  //follow
  socket.on('followed',function(data){
   
   data = data.data;
   
   console.log(data);
   //prepend to
   
   if(page_not == 1)
    append_notification(data);
   
  });
  

  
  
  
  //auto resize
   
   var $parent = $('ul.notification').find('li');
   var width = $parent.eq(0).find('span.holder_not').width() + 250;
   
   var width_full = $parent.width() - width;
   

   
   $parent.find('span.content').each(function(){
    $(this).css('width',width_full+'px');
   });
  
  
  //resize for notifications
  $(window).resize(function(){
   
   var $parent = $('ul.notification').find('li');
   var width = $parent.eq(0).find('span.holder_not').width() + 250;
   
   var width_full = $parent.width() - width;
   

   
   $parent.find('span.content').each(function(){
    $(this).css('width',width_full+'px');
   });
   
  });

// change index posts

$(document).on('click','div.menu_index span.tab',function(){

 var what = $(this).hasClass('news') ? 'news' : 'top';
 
 
 //add and remove old classes
 $('div.menu_index span.selected').removeClass('selected');
 $(this).addClass('selected');
 
 //check if was not clicked before

	$.get('/requests',{action:'index_frame',what:what},function(response){

		if(response.status == 'ok'){

		
		
		 
		  for(var i = 0;i<=response.data.length;i++)
			if(response.data[i])
			 if(what == 'top')
			  append_to_timeline(response.data[i],true,'prepend','top');
			 else 
			  append_to_timeline(response.data[i],true,'prepend');
	      
		  //remove old
		
		   if(what == 'top')
		   {
		    $('div.post').not('.index_top').each(function(){
			 $(this).remove();
		    });
		   }
		   else
		   {
		    $('div.post.index_top').each(function(){
			 $(this).remove();
		    });
		   }
		   
		} 



	},'JSON');

  

});


//set the localstorage for posts 
//just one post / minute

if(!localStorage['last_post']) localStorage['last_post'] = 0;

//======== settings

$(document).on('change','input[name=thumbnail]',function(){
 
 $('form#upload_image').submit();

});

//settings
$(document).on('click','button.save_sett',function(){

 var password = $('input[name=password]').val();
 var password2= $('input[name=password_again]').val();
 
 var email    = $('input[name=email]').val();
 
 var avatar   = $('div.avatar_sett').attr('data_src');
 
 var fname    = $('input[name=fname]').val();
 var sname    = $('input[name=sname]').val();
 
 var $saved = $(this);
 
 
 if(password != password2 || password.length < 3){
  $saved.text("Password doesn't match.");
 }
 else
 {
  if(email.length < 3 || email.search('@') < 0){
   $saved.text("Email is invalid.");
  }
  else
  {
  
   $saved.text('Loading..');
  
   $.post('/requests',{action:'settings',password:password,email:email,avatar:avatar,fname:fname,sname:sname},function(response){
   
     if(response.status == 'email_took')
	  $saved.text('Email is already taken.');
	 else
	 {
	  if(response.status == 'error')
	   $saved.text('Error, try again.');
	  else
	  {
	   if(response.status == 'done')
		$saved.text('Done');
	   else
	    $saved.text('Error, try again.');
	  }
	 
	 
	 }
   },'JSON');
  
  
  }
 }
 
});




//==== landing page

//change tabs
$(document).on('click','span.tab',function(){
 
 if(!$(this).hasClass('selected'))
 {
   var $height = $('section.forms_holder');
   
   if($(this).attr('class').search('sing') > -1)
   {
    $('section.forms_holder').find('div.sing').show();
	$('section.forms_holder').find('div.log').hide();
	$(this).addClass('selected');
	$('span.tab.log').removeClass('selected');
    $height.css('height','470px'); 
   
   }  
   else
   {
    $('section.forms_holder').find('div.log').show();
	$('section.forms_holder').find('div.sing').hide();
	$(this).addClass('selected');
	$('span.tab.sing').removeClass('selected'); 
	$height.css('height','300px');
   }
 
 }

});

//login
$(document).on('click','button.front.login',function(){
  
   var data = {email : $('input[name=email]').eq(1).val(),
               password  : $('input[name=password]').eq(1).val(),
			   action: 'login'};
			   
			   
   var $saved = $(this);
   
   $saved.text('Loading..');
   
   $.post('/requests',data,function(response){
   
   console.log(response);
    
	if(response.status == 'error'){
	 $saved.text('Please try again.');
	}
	else
	{
	 if(response.status == 'done')
	 {
	  $saved.text('Redirecting..');
	  window.location.href = '/';
	 }
	 else
	  $saved.text('Try again');	
	}
   
   });
   
   
});


//singin
$(document).on('click','button.front.singin',function(){

   var data = {fname   :$('input[name=fname]').val(),
               sname   :$('input[name=sname]').val(),
			   password:$('input[name=password]').val(),
			   email   :$('input[name=email]').val(),
			   action  :'register'};
			   
   var $saved = $(this);			   
			   
   if(data.fname != '' && data.sname != '' && data.pass != ''){
    
	 $saved.text('Loading..');
	 $.post('/requests',data,function(response){
	  
	   if(response.status == 'error')
	    $saved.text('Error. Try again');
	   else 
	   {
	    $saved.text('Done, redirecting..');
	    window.location.href = '/profiles/'+data.fname+'.'+data.sname+'.'+response.id;
	   }
	 },'JSON');
     
   }
   else
    $saved.text('Complete all forms.');

});

		


/* profile */
//follow
$(document).on('click','span.follow',function(){
 
 var id = get_user_id();
 
 
 var $saved = $(this);
 if(!$(this).hasClass('following')){
  $.post('/requests',{'action':'follow','who':id},function(response){
  
   if(response.status == 'login-error')
    login_error();//cal loggin error function /general function
   else
   {
    if(response.status == 'ok')
	{
     
	 var pre_name = window.location.href.split('/')[window.location.href.split('/').length -1].split('.');
	 
	 
	 var data_obj = {
	  user_id: id,
	  not_id : response.not_id,
	  name   : pre_name[0]+' '+pre_name[1],
	  data   : get_data(),
	  type   : 2
	 };
	 
	 console.log(data_obj);
	 
	 $saved.text('Following').addClass('following');
	 socket.emit('follow',{id:cookie('login_user'),data:data_obj});   
	}
	else
	 $saved.text('Error');
   }
  
  },'JSON');
 
 }
 
});


//unfollow

$(document).on('click','span.following',function(){
 
 var id = get_user_id();
 
 var $saved = $(this);

  $.post('/requests',{'action':'unfollow','who':id},function(response){
  
   if(response.status == 'login-error')
    login_error();//cal loggin error function /general function
   else
   {
    if(response.status == 'ok')
     $saved.text('Follow').removeClass('following');
	else
	 $saved.text('Error');
   }
  
  },'JSON');
 

 
});


//=================== general


//next/ preview notifications

$(document).on('click','span#notification_n',function(){


 
  var action = $(this).attr('class');
  
  var $saved = $(this);
  

  
  if(action == 'next'){
	  if(page_not < 100) page_not++;
  }
  else
      if(page_not > 1) page_not--;
	  
	  
   set_page_nr(page_not); //set page number
	
  

  
  $.get('/requests',{'action':'notification_page','what':action,'page':page_not},function(response){
   
    var data = response.rows;
	var array_id = [];
	//console.log(data);
	

	

	for(var i=0;i<=data.length;i++)
	{
	 if(data[i])
	 {
      var data_ = data[i];
       
       	   
	  //console.log(data_.seen);
	  if(data_.seen == 0)
	   array_id.push(data_.id_not);
      
	 // console.log(data_);
	  
	  append_notification(data_,true);
     }
	}
   

  
    if(array_id.length > 0)
	{
     array_id = JSON.stringify(array_id);

     console.log(array_id);
	 $.post('/requests',{'action':'unread_clear','data':array_id});
	
	}
	
  
  },'JSON');

});

//logout
$(document).on('click','button.logout',function(){

 $(this).text('Redirecting..');
 

 $.post('/requests',{action:'logout'},function(response){
  
  if(response.status == 'ok')
   window.location.href= '/';
   
   
 },'JSON');

});

//send post
$(document).on('click','button.add_post',function(){
 
  var obj_data = {author  :$('input.author').val(),
                  hashtags:$('input.hashtags').val(),
				  quote   :$('textarea.quote').val(),
				  action  :'add_post'};
				  
  
  var $button = $('button.add_post');
  
  var seconds = new Date() / 1000;
  
  if(seconds - localStorage['last_post'] > 60 || 1 == 1)
  {
	  
	  $button.text('LOADING...');
	  
	  if(obj_data.author == '' || obj_data.hashtags == '' || obj_data.quote == '')
	   $button.text('Please complete all forms and try again');
	  else
	  {
	   $.post('/requests',obj_data,function(response){
		  		  
		   
         obj_data.id        = response.insert_id;
		 obj_data.user_name = response.user_data.name;
		 obj_data.user_id   = response.user_data.id;
		 obj_data.text      = obj_data.quote;
		 obj_data.source    = obj_data.author;
		 
		 
		 if(response.status == 'ok'){
			 //hide box
			 
			localStorage['last_post'] = new Date() / 1000;
		  
			$button.text('Done');
			
			
			if(isIndex() && window.location.hash == ''){
			 append_to_timeline(obj_data,true);
			

			 //hide after 2 sec
			 setTimeout(function(){
			  if($('span.add').hasClass('visible')) // if it's still visible	 
			   show_add_box();
			 },2000);
			}

			
		 }
		 else{
		  $button.text('Error, please try again.')
		 }
	   
	   },'JSON');
	  
	  }
   }
   else
    {
	 $button.text('You must wait one minute before adding a new post.');
	 setTimeout(function(){
	  $button.text('SEND');
	 },3000);
	}
  
});

 /***************************** separe show effects ( add class ) *********************/ 
//show add
 $(document).on('click','span.add',function(){
   
   show_add_box('add');
 });
 
 //show settings
  $(document).on('click','span.settings',function(){
   
   show_add_box('settings');
 });
 
//show
 $(document).on('click','span.notification',function(){
   
   if($(this).hasClass('unread'))
   {
    $(this).removeClass('unread');
	
	var array_id = [];
	
	$('ul.notification li').each(function(e){
	 
	 array_id.push($(this).attr('data_id'));
	 
	});
	
	array_id = JSON.stringify(array_id);

    console.log(array_id);
	$.post('/requests',{'action':'unread_clear','data':array_id},function(response){
	
	 if(response.status == 'done')
	  console.log('done');
	 else
	  console.log('error');
	
	
	},'JSON');
   
   }
   show_add_box('notification');
 });

 
 

 
 //==================================search and hashtags
 
 //search by hashtag and show related posts
 if(isIndex())
 {
  if(window.location.hash.search('search') > -1)
  { //search
   var key_search = window.location.hash.split('=')[1];
   
   $('input.search').val(key_search);//add value to search input 
   
   search_posts(key_search);
  }
  else
  { //show related posts
   
   if(window.location.hash.search('hashtag') > -1){

	 var key_search = window.location.hash.split('=')[1];
     
	 search_posts(key_search,true);

    }
	
  }
 
 }
 
 //normal search
 $(document).on('keyup','input.search',function(e)
 { 
 
  var code = e.keyCode || e.which;
  
  console.log(code);
  
  if(code == 13 && $(this).val() != ''){
  
  if(isIndex())
  {
  
  search_posts($(this).val());
  
  window.location.hash = '#search='+$(this).val();
  
  //make effect
  
   $('div.post').each(function(){
    
	var $saved = $(this);
	setTimeout(function(){
	
    	
	 $saved.addClass('remove');
	  
	},50);
   
   });
  
  }
   else
   window.location = '/#search='+$(this).val();
  }

 
 });
 

 //search by hashtag
 $(window).on('hashchange',function(){
 
 if(isIndex() && window.location.hash.search('search') < 0){
 
  var key = window.location.hash.split('hashtag=')[1];
  
  console.log(key);
  
  search_posts(key,true);
  
 } 
 
 });
 
 
 //confirm
 $(document).on('click','p.uname span',function(){
  
  if(!$(this).hasClass('delete'))
   $(this).text('Click to confirm').addClass('delete');
 
 });
 
 $(document).on('click','p.uname span.delete',function(){
  
  var $saved = $(this);
  $saved.text('Loading..');
  
  $.post('/requests',{action:'delete_post',id:$(this).attr('delete_id')},function(response){
     
	 
	if(response.status == 'no-login')
	    window.location.href = '/';
	
	
	if(response.status == 'ok')
	{
	 $saved.parent('p').parent('div').addClass('remove');
	 
	 setTimeout(function(){
	   var $post = $saved.parent('p').parent('div');
	   
       $post.css({"visibility":"hidden",display:'block'}).slideUp();
	  
	  
	   //remove the html
	   setTimeout(function(){
	    $post.remove();
	   },500);
         	   
	 },1000);
	}
	else
	 $saved.text('Error');
  
  },'JSON');
 
 });
 
 
 //report button
 $(document).on('click','a.reportbtn',function()
  {
   event.preventDefault();
   
   $(this).addClass('reported').addClass('keyframe');
   var $post = $(this).parent('li').parent('ul').parent('.post');
   

   $post.addClass('remove');
   setTimeout(function(){
      $post.css({"visibility":"hidden",display:'block'}).slideUp();
	  
	  
	   //remove the html
	   setTimeout(function(){
	    $post.remove();
	   },500);
	  
   },1000);
   
   $.post('/requests',{'action':'report','id':$(this).attr('data')},function(response){
    
	 if(response.status == 'no-login')
	    window.location.href = '/';
   
   
   },'JSON');
   
   
  });
  
  
 //like button
 $(document).on('click','a.lovebtn',function(){
 
   event.preventDefault();

   var $saved = $(this);
  
   if(!$(this).hasClass('loved'))
   { //like
    
   
    $(this).addClass('loved');
    $.post('/requests',{'action':'love','id':$(this).attr('data'),'user_id':$(this).attr('data_user')},function(response){
     
	 
	 //send data to	
  	 if(response.status == 'done')
	 {
	  
	  //add +1
	  
	  var $nr = $saved.parent('li').find('span');
	  
	  $nr.text(Number($nr.text()) +1);
	  
	  //grab the data from current element
	  
	 
	  var $elem = $saved.parent('li').parent('ul').parent('div.post');
	  
	  var data_obj = {id     :$saved.attr('data'),
	                  text   :$elem.find('p.content').text(),
				      name   :$elem.find('p.uname').find('a').text(),
				      source :	$elem.find('p.source').text(),
					  //take logged id from server response
					  user_id:response.user_id,
					  data   : get_data(),
					  not_id : response.not_id,
					  type   : 1,
					  avatar : response.avatar};
	  
	  console.log(data_obj);
	  
	  socket.emit('love',{id:cookie('login_user'),data:data_obj});   
     
	 }
	 
	  if(response.status == 'no-login')
	    window.location.href = '/';
     
	 
    },'JSON');
   }
   else
   { //dislike
    $(this).removeClass('loved');
    $.post('/requests',{'action':'unlove','id':$(this).attr('data')},function(response){
  
      if(response.status == 'no-login')
	    window.location.href = '/';
	    
    }); 
   }
  
    

 });
  
  
  //loading more
 $(document).on('click','button.loading_more',function()
  {
  
   var $saved = $(this);
   
   $saved.text('Loading..');
   
   //set cases
   var cases = null;
   var key   = null;
   
   if(window.location.href.search('profile') > -1)
   {
    cases = 'profile';
    key   = window.location.href.split('.')[window.location.href.split('.').length -1];
   }	
   
   if(window.location.hash.search('search') > -1)
   {
    cases = 'search';
    key = window.location.hash.split('search=')[1];
   }
   
   if(window.location.hash.search('hashtag=') > -1)
   {
    cases = 'hashtag';
    key   = window.location.hash.split('hashtag=')[1];	
   }
   
   
   
   
   if(isIndex() && window.location.hash == '' )
   {
     
	  
	  cases = $('span.tab.selected').hasClass('news') ? 'index' : 'index_top';
	  
   
   }
   
   $.get('/requests',{'action':'load_more','number':$('div.post').length,'cases':cases,'key':key},function(response){
  
    if(response.data.length == 0){  
	 $saved.text(" :( Sorry, we can't find more posts ");
	}
    else
    {	
	 $saved.text('I want more');
	
	
 	 //delete old elements
	 
	
	 //append elements
     $.each(response.data,function(index,value){
	 
	  //append to index / top param
	  if(cases == 'index_top')
	   append_to_timeline(value,true,'append','top');
 	  else
	   append_to_timeline(value,true,'append');
	 
	 });
    
	}   
  
   },'JSON');
  });
  
  
  //show newest posts
  $(document).on('click','.popupntf',function(){
   
   $(this).fadeOut('fast');
   
   $('div.post.to_add').each(function(e){
     
	 var $post = $(this);
	 
	 setTimeout(function(){
	 
	  $post.removeClass('to_add').addClass('add');
	 
	 },e*50);
     
   });
  
  });
  
  
  //check constantly for new posts

  

  
   var interval_new_posts= setInterval(function(){
  
   var obj_check = {id:$('div.post').eq(0).find('a.reportbtn').attr('data'),action:'new_posts'};

   
    if(isIndex() && !cookie('login_user'))
     {
      clearInterval(interval_new_posts);
	  return;
     }    
	
 
   $.get('/requests',obj_check,function(response){
   
	  //show the 'load' button
	  var length = response.length
	  if(length > 0)
	  $('div.popupntf').fadeIn('fast').find('p.alert').text(length+ " new quotes");
	         

	  
      $.each(response,function(index,val){
	   
	   //update object
	   obj_check.id = val.id;
	
	   //append but don't show
       append_to_timeline(val,false);
      
	  
	  });	  
       
   },'JSON');   
  
  },1000*50);
  
  //functions
  
  //function remove_other boxes
  function remove_other_add(except,callback){
   
   var seconds = 0;
  
   $('div.add_new').each(function(){
    
	if(!$(this).hasClass(except) && $(this).hasClass('visible')){
	 
	 //parse class
	 var class_p = $(this).attr('class').split(' ')[1];
	 
	 $(this).removeClass('visible');
	 $('li span.'+class_p).removeClass('visible');
	
	 seconds += 0.5;// how long does the animation need to be finished
	}
   
   });
   
   
   setTimeout(function(){ //after the animation is over
   
    if(typeof(callback) == 'function' && callback)
    callback();
	
   },seconds*1000);
  }
  
  //show add boxes
  function show_add_box(which){
   
   var $span = $('span.'+which);
   
   //remove others
   remove_other_add(which,function(){
	   
	   if($span.hasClass('visible'))
	   {
		$span.removeClass('visible');
		$('div.add_new.'+which).removeClass('visible');
	   }
	   else
	   {
		 $('div.add_new.'+which).addClass('visible');
		 $span.addClass('visible');
	   }
	   
   });
  }
  
  //append to timeline
  function append_to_timeline(val,bool,prepend,param){
  

  if(val.user_id)
  {
  
  if(prepend == '' || !prepend)
   prepend = 'prepend';
  
   obj_check = {id:val.id,action:'new_posts'};
   
   if(window.location.href.search('post') <0)
   {
     //append the item
	 var $html = $('div.post').eq(0).clone();
	
	
	 if(!val.fname || !val.sname)
	 {
	  val.fname = val.user_name.split(' ')[0];
	  val.sname = val.user_name.split(' ')[1];
	 }

	 
	 $html.find('p.uname').find('a').attr('href','/profile/'+val.fname+'.'+val.sname+'.'+val.user_id).text(val.fname+" "+val.sname); //add user name
			
     $html.find('p.content').text(val.text) //add text
	
     if(val.loved == 'loved' && val.loved)	
	  $html.find('a.lovebtn').attr('data',val.id).removeClass('loved').addClass('loved');
	 else 
	  $html.find('a.lovebtn').attr('data',val.id).removeClass('loved');
	 
	 
	 $html.find('a.reportbton').attr('data',val.id);
			
	 $html.find('p.source').text(val.source);
	 
	 //add hashtags
	 var $hashtags = $html.find('a.hashtag');
	 
	 var $hash = $hashtags.eq(0).clone();
	 
	 $hashtags.remove();
	 
	 if(val.hashtags)
	  {
	    //console.log(typeof(val.hashtags));
	   if(typeof(val.hashtags) != 'object')
	    var hashtags_s = val.hashtags.split(',');
	   else
	    var hashtags_s = val.hashtags;
	    

	   
	   
	   for(var i = 0;i<=hashtags_s.length;i++)
	    if(hashtags_s[i])
		{
		 $hash.attr('href','#hashtag='+hashtags_s[i]).text(hashtags_s[i]);
		 $html.find('p.content').after($hash);
		}
	  
	  }
	 
	 // index , attention
	 if(param == 'top')
	  $html.addClass('index_top');
	 else
	  if($html.hasClass('index_top'))
	    $html.removeClass('index_top');

			
	 if(prepend == 'prepend')		
	  $('div.posts_holder').prepend($html);
	 else 
	  $('div.posts_holder').append($html);
            
     
	 //append but don't show
	 if(bool == true)
	  $('div.posts_holder').find('div.post').eq(0).addClass('add');			
	 else
	  $('div.posts_holder').find('div.post').eq(0).addClass('to_add');			
     		
	}
  
   }
  
  }
  
  
  function append_notification(data,bool){
  
   //console.log(data);
   
   if(data.type == 1)
   {
       var $clone = $('<li data_id="0" ><img src="/../files/'+data.avatar+'" class="avatar"><span class="text"><span class="holder_not"> <a class="not user" href="/profile/Cozloschi.Florin.5">Cozloschi Florin</a> loves your <a class="not" href="/posts/47">post.</a> </span> <span class="content" style="width: 492px;">- "  "</span> <span class="data">25-11-2014 18:21:10</span></span><img src="images/line.png" class="separator"></li>');
   

	   if(bool != true)
	   {
	    //add value and unread
	    var $not_nr = $('span.notification');
	   
	    $not_nr.addClass('unread');
		
		$not_nr.attr('last_id',data.not_id);
	   
	    $not_nr.text(Number($not_nr.text())+1);
	   }
	   
	   //put name 
	   var $text = $clone.find('span.text');
	   $text.find('a.user').text(data.name).attr('href','/profile/'+data.name.replace(' ','.')+'.'+data.user_id);
	   
	   //add data_id
	   $clone.attr('data_id',data.not_id);
	  

	   
	   //post
	   $text.find('a.not').eq(1).attr('href','/posts/'+data.id);
	   
	   //data
	   $text.find('span.data').text(data.data);
	   
	   //content
	   $text.find('span.content').text('- " '+data.text+' "');
	   
	   $('ul.notification').prepend($clone);
	   
	   //delete what's old
	   var leng = $('ul.notification').find('li').length;
	   
	   if(leng > 5)
		{
		  var $not = $('ul.notification').find('li');
		  for(var i =5;i<=leng;i++){
		   
		   $not.eq(i).remove();
		  
		  }
		}
	
   }
   else
   {
       var $clone = $('<li ><img src="/../files/'+data.avatar+'" class="avatar"><span class="text"><span class="holder_not"> <a class="not user" href="/profile/"></a> is following you.<span class="content">  </span> </span><span class="data">25-11-2014 18:17:43</span></span><img src="/../images/line.png" class="separator"></li>');
   
 
	   if(bool != true)
	   { 
	    //add value and unread
	    var $not_nr = $('span.notification');
		
		//add last id
		$not_nr.attr('last_id',data.not_id);
	   
	    $not_nr.addClass('unread');
	   
	    $not_nr.text(Number($not_nr.text())+1);
	   }
	   
	   var $text = $clone.find('span.text');  
	   
	   $clone.attr('data_id',data.not_id);
	   
	   if(data.type == 1){
		//put name 

		$text.find('a.user').text(data.name).attr('href','/profile/'+data.name.replace(' ','.')+'.'+data.user_id);
	   
		//add data_id
		$clone.attr('data_id',data.not_id);

	  
		//data 
		$text.find('span.data').text(data.data);
	   }
	   else
	   {
		//$text.find('span.content').remove();
		
		$text = $text.find('span.holder_not');
		
		$text.find('span.data').text(data.data);
		$text.find('a.user').text(data.name).attr('href','/profile/'+data.name.replace(' ','.')+'.'+data.user_id);
		$text.find('a.not').eq(2).remove(); 
		var $a = $text.find('a').wrap('<p/>').parent().clone();
		
		
		
		$text.html($a.html() + ' is following you. ');
	   
	   }
		console.log($clone.html());
	   $('ul.notification').prepend($clone);
	   
	   //delete what's old
	   var leng = $('ul.notification').find('li').length;
	   
	   if(leng > 5)
		{
		  var $not = $('ul.notification').find('li');
		  for(var i =5;i<=leng;i++){
		   
		   $not.eq(i).remove();
		  
		  }
		}
	   
   
   }
  
  
  }
  
  //set page notifications nr
  
  function set_page_nr(number){
   
   $('span.page_nr').text(number);
   
  }
  
//get user id
 function get_user_id(){
  var id = window.location.href.split('.')[window.location.href.split('.').length-1];
  return id.search('#') ? id.replace('#','') : id;
 }
 
 
 //if it's index
 function isIndex(){
   
  if(window.location.href.split('/').length > 4)
   return false;
  else
   return true;
  
 }
 
 //search posts
 
 function search_posts(key,bool){
  
  bool = bool == '' ? false : true;
  
  //make request
   $.get('/requests',{'action':'search','key':key,'type':bool},function(response){
  
    setTimeout(function(){
     $.each(response,function(index,val){
	  
	  append_to_timeline(val,true);
			
	 }); 
	 
     $('div.post').each(function(){
	 
	  if(!$(this).hasClass('add'))
	   $(this).remove();
	 
	 });
	 
	 },100);
   },'JSON'); 
 
 }
   
function get_data(){
     
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
	
	return today;

}


function cookie(cookie){
 
  if(document.cookie.search(cookie) < 0)
   return false;
  else
   return document.cookie.split(';')[0].split('=')[1];

}
   
   

   
});

function done_image(image_name){

 $('div.avatar_sett').css('background-image','url("/files/'+image_name+'")').attr('data_src',image_name);
} 

var updateSize = function () {
        var width = parseInt($('#width').val(), 10);
        var height = parseInt($('#height').val(), 10);
        $('#Default').width(width).height(height).perfectScrollbar('update');
      };