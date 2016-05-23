angular.module('starter.controllers', ['starter.services','firebase'])

.controller("LoginCtrl", function($scope, $firebaseAuth, $ionicLoading, $state, $http, $cordovaOauth, appConfig) {

    $scope.data = {
        username:'',
        userphoto:'',
        email:'',
        password:''
    };

    if(window.localStorage.getItem("user_info") != null) {
        // $ionicViewService.nextViewOptions({
        //     disableAnimate: true,
        //     disableBack: true
        // });
        console.log("user info exists");
        $state.go('tab.map');
    }

    var auth = $firebaseAuth(new Firebase(appConfig.FirebaseUrl));

    $scope.facebookLogin = function() {

        $ionicLoading.show({
          template: 'Logging into facebook....'
        });

        if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {

          $cordovaOauth.facebook("926779574008579", ["email"]).then(function(result) {
              auth.$authWithOAuthToken("facebook", result.access_token).then(function(authData) {
                  // console.log(JSON.stringify(authData));

                  var accessToken = result.access_token;
                  console.log(accessToken);

                  $http.get("https://graph.facebook.com/v2.2/me", { params: { access_token: accessToken, fields: "id,name,gender,location,website,picture,relationship_status", format: "json" }}).then(function(result) {

                      console.log(result.data);
                      $scope.profileData = result.data;
                      var user = result.data;

                      var user_info =
                            {
                              '_id':user.id,
                              'name':user.name,
                              'email':user.email,
                              'pic':"http://graph.facebook.com/"+user.id+"/picture?width=160&height=160"
                            };

                      console.log(user_info);
                      //$scope.user = user;
                      window.localStorage.setItem("user_info",JSON.stringify(user_info));

                      $ionicLoading.hide();

                      console.log("Go to Map screen");
                      $state.go('tab.map');

              }, function(error) {
                  alert("There was a problem getting your profile.  Check the logs for details.");
                  console.error("ERROR: " + error);
              });
          }, function(error) {
              alert("There was a problem signing in using facebook! Please try again.");
              console.log("ERROR: " + error);
          });
      });
    }else{
      console.log("cannot login from browser");

      $ionicLoading.hide();
    }
  }

})

.controller('MapCtrl', function($scope, $ionicLoading, $state, $stateParams, $compile, Points) {

  var points = Points;
  //TODO: Move this to services
  var markers = Points.all();

  $ionicLoading.show({
      template: 'Loading map points....'
    });

  markers.$loaded().then(function(markers) {

        console.log("Load data from firebase and initialize map");
        console.log(markers);

        var myLatlng = new google.maps.LatLng(13.1704468,-59.6357891); //Sandy Lane Golf Course lol

        var mapOptions = {
          center: myLatlng,
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById("map"),mapOptions);
        $ionicLoading.show({
            template: 'Getting location....'
          });
        //Detect user's location
        navigator.geolocation.getCurrentPosition(function(pos) {


          console.log("user location found");

            //Set map location
            map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));

            $ionicLoading.hide();
            //Add map marker
            var myLocation = new google.maps.Marker({
                position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
                map: map,
                title: "My Location"
            });

            //Add infowindow
            var infowindow = new google.maps.InfoWindow({
              content: "You Are Here!"
            });

            //Display infowindow when user clicks on map marker
            google.maps.event.addListener(myLocation, 'click', function() {
              infowindow.open(map,myLocation);
            });
        });




        for(var x=0;x < markers.length;x++){

          var markerinfo = new google.maps.Marker({
            position: new google.maps.LatLng(markers[x].latitude,markers[x].longitude),
            map: map,
            title: markers[x].title
          });

          //Load marker and infowindow
          /*var contentString = "<div><a ng-click='clickTest("+markers[x].id+")'>"+markers[x].title+"</a></div>";
          var compiled = $compile(contentString)($scope);

          var infowindow = new google.maps.InfoWindow({
            content: compiled[0]
          });


          google.maps.event.addListener(markerinfo, 'click', function() {
            infowindow.open(map,markerinfo);
          });*/

        }

        console.log("Load map div");
        $scope.map = map;

        $ionicLoading.hide();
    });


    $scope.centerOnMe = function() {
        if(!$scope.map) {
            return;
        }

        $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $ionicLoading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
    };

    //TODO: Fix this. Param is passing but content is not loading
    $scope.clickTest = function(point_id) {

        $state.go('tab.point-info', { pointId:point_id });

    };

})



.controller('PointsCtrl', function($scope, Points) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.points = Points.all();


})

.controller('PointInfoCtrl', function($scope, $stateParams, $firebase, $firebaseArray, Points, Comments, $ionicModal, $cordovaCamera, appConfig) {

  console.log($stateParams);
  console.log("showing point info");
  // $scope.points = Points.all();
  $scope.point = Points.get($stateParams.pointId);
  $scope.point_id = $stateParams.pointId;

  $scope.comments = Comments.all($scope.point_id);

  console.log($scope.point);

  // var userinfo = JSON.parse(localStorage.getItem("user_info"));
  // $scope.userinfo = userinfo;
  // console.log(userinfo);

  $ionicModal.fromTemplateUrl('templates/modal-newComment.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.commentmodal = modal;
  });


  // $scope.chats = Chats.all();
  $scope.addComment = function() {
    $scope.commentmodal.show()
  };

  $scope.closeCommentModal = function() {
    $scope.commentmodal.hide();
  };

  var timeInMs = Date.now(); //Get time in milliseconds
  console.log(timeInMs);
  $scope.comment = [{
    text:'',
    point_id:'',
    // comment_author:userinfo._id,
    comment_date: timeInMs
  }];

  // $ionicHistory.clearHistory();

  $scope.images = [];


  var data = new Firebase(appConfig.FirebaseUrl);
  var syncArray = $firebaseArray(data.child("images"));
  $scope.images = syncArray;

  $scope.takePhoto = function() {
      var options = {
          quality : 75,
          destinationType : Camera.DestinationType.DATA_URL,
          sourceType : Camera.PictureSourceType.CAMERA,
          allowEdit : true,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
          targetWidth: 500,
          targetHeight: 500,
          saveToPhotoAlbum: false
      };

      //TODO: Attach this to a comment
      $cordovaCamera.getPicture(options).then(function(imageData) {
          syncArray.$add({image: imageData}).then(function() {
              alert("Image has been uploaded");
          });
      }, function(error) {
          console.error(error);
      });
  }

  $scope.saveComment = function(form){

    var ref = new Firebase(appConfig.FirebaseUrl);
    var commentsRef = ref.child("comments");

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd
    }
    if(mm<10){
        mm='0'+mm
    }
    var today = dd+'-'+mm+'-'+yyyy;

    commentsRef.push({
        text: $scope.comment.text,
        point_id: parseInt($scope.point_id),
        date_added: today
    });

    //Clear the comment fields
    $scope.comment.text = '';
    $scope.comment.point_id = '';

    //Hide modal
    $scope.commentmodal.hide();

  }

})

.controller('AccountCtrl', function($scope,$state,appConfig) {


  /*if(window.localStorage.getItem("user_info") === "undefined" || window.localStorage.getItem("user_info") === null) {
        // $ionicViewService.nextViewOptions({
        //     disableAnimate: true,
        //     disableBack: true
        // });
        console.log("redirecting to login");
        $state.go('login')
    }*/

    var userinfo = JSON.parse(localStorage.getItem("user_info"));
    $scope.userinfo = userinfo;
    console.log(userinfo);

    if(userinfo == null){
      alert('You are not logged in');
    }

    $scope.Logout = function(){
      console.log("logging out");
      var ref = new Firebase(appConfig.FirebaseUrl);
      ref.unauth();
      localStorage.clear();
      $state.go('login');
    }

})
