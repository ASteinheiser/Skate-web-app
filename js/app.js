var app = angular.module('MyApp',['ngMaterial']);

app.controller('AppCtrl', function($scope, $mdDialog) {

  var sessionNumber = 0;
  var savedSessions = [];
  $scope.rawDistance = 0;
  $scope.displayDistance = 0;
  $scope.push = 0;
  $scope.displayDistancePerPush = 0;

  $scope.reset = function(){
    conn.message({"devices": ["*"], "reset": true});
  };

  $scope.resetSessions = function(){
    savedSessions = [];
    sessionNumber = 0;
    conn.update({"savedSessions": savedSessions});
  };

  $scope.saveSession = function(){
    sessionNumber ++;
    savedSessions.unshift({"session": sessionNumber, "distance": $scope.rawDistance, "pushes": $scope.push});
    conn.update({"savedSessions": savedSessions});
    $scope.reset();
  };

  $scope.showSessions = function(ev) {
    $mdDialog.show(
      $mdDialog.alert()
        .parent(angular.element(document.querySelector('#popupContainer')))
        .clickOutsideToClose(true)
        .title('Saved Sessions:')
        .textContent(savedSessions)
        .ok('close')
        .targetEvent(ev)
    );
  };

  var uuid = localStorage.getItem('skate-web-app.uuid');
  var token = localStorage.getItem('skate-web-app.token');

  var meshbluDevice = {};

  if(uuid != "null" && token != "null"){
    meshbluDevice.uuid = uuid;
    meshbluDevice.token = token;
  }

  var conn = meshblu.createConnection(meshbluDevice);

  conn.on('ready', function(data){
    console.log('UUID AUTHENTICATED!');
    console.log(data);

    localStorage.setItem('skate-web-app.uuid', data.uuid);
    localStorage.setItem('skate-web-app.token', data.token);

    conn.whoami({}, function(device){
      if (device.savedSessions){
        savedSessions = device.savedSessions;
      }
      if (savedSessions[0]){
        sessionNumber = savedSessions[0].session;
      }
    });

    conn.update({
      "uuid": uuid,
      "type": "device:skate-web-app",
      "logoUrl": "https://s3-us-west-2.amazonaws.com/octoblu-icons/device/skate-web-app.svg"
    });

    conn.on('message', function(message){

      $scope.push = message.payload.pushes;
      $scope.rawDistance = message.payload.distance;

      $scope.displayDistance = $scope.rawDistance.toFixed(2) + " meters";
      $scope.displayDistancePerPush = ($scope.rawDistance/$scope.push).toFixed(2) + " meters";

      $scope.$apply();
    });
  });
});
