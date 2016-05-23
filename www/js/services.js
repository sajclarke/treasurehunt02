angular.module('starter.services', ['firebase'])


.factory("Points", function($firebaseArray, localStorageService, appConfig) {

  var points = [];

  var data = new Firebase(appConfig.FirebaseUrl);

  var points = $firebaseArray(data.child("points"));

  points.$loaded().then(function(points) {
   console.log(points.length); // data is loaded here
   if(points.length == 0){

     console.log('Setup Firebase database');

     var fb = new Firebase(appConfig.FirebaseUrl);
     fb.set(
       {
         "points": [
         {
             id:1,
             title: "Grapefruit of Wrath",
             hint:"What is sweet and angry?",
             latitude: 13.105849,
             longitude: -59.5815219
         },
         {
             id:2,
             title: "Wind Through the Keyhole",
             hint:"What blows through small spaces?",
             latitude: 13.1337264,
             longitude: -59.5594634
         },
         {
             id:3,
             title: "Art of Racing in the Rain",
             hint:"Sun Tzu",
             latitude: 13.1091092,
             longitude: -59.4897689
         }
       ]
     },function(data){

     });

     var points = $firebaseArray(data.child("points"));
     window.localStorage.setItem("points_data", JSON.stringify(points));
     console.log("Loading new points data", points);

   }else{
     window.localStorage.setItem("points_data", JSON.stringify(points));
   }
  });


  // if (localStorageService.get('pointsData')) {
  //   console.log('load from local');
  //   points = localStorageService.get('pointsData');
  // } else {


  // var points_data = new Firebase(appConfig.FirebaseUrl+"/points");
  //
  // points = $firebaseArray(points_data);




  // localStorageService.set('pointsData', points);

  console.log(localStorage.getItem('points_data'));


  // console.log(points);


  return {
		all:function() {


      return points;

    },
    get:function(id){
      var points_arr = points;

      var sel_point = '';

      console.log("Getting info for point ID:"+id);

      for(var i=0;i<points_arr.length;i++){
        // console.log(points[i].id,id);
        if(points[i].id == id){
          sel_point = points[i];
        }
      }

      // console.log(points_arr);
      // console.log(sel_point);

      return sel_point;

    }
  }

})

.factory("Comments", function($firebaseArray, appConfig) {

  var data = new Firebase(appConfig.FirebaseUrl);



  return {
		all:function(pointId) {



      var comments = $firebaseArray(data.child("comments"));

      console.log("Getting comments for point ID:"+pointId);
      console.log(comments);
      //TODO: Fix to select correct comments for chosen point
      // if(comments.length)

      var arr_comments = comments;

      comments.$loaded().then(function(commentss) {
         console.log("Number of comments",comments.length); // data is loaded here
         var num_comments = comments.length;
         for(var i=0;i<num_comments;i++){

           pointId = parseInt(pointId);

           console.log("Loop "+i,arr_comments[i].point_id,pointId);
           console.log("Comment text: " + arr_comments[i].text);

           // pointId = parseInt(pointId);
           if(arr_comments[i].point_id != pointId){
             console.log("Removed since it has id:" + arr_comments[i].point_id);
             arr_comments.splice(i,1);
            // console.log(comments[i].point_id,pointId);
           }
          //  console.log(comments[i].text);
         }

      });



      // arr_comments = comments;
      // console.log(arr_comments);
      return arr_comments;

    }
  }

});
