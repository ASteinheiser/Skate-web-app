var app = angular.module('MyApp',['ngMaterial']);

app.controller('AppCtrl', function($scope, $mdDialog) {

  $scope.rawDistance = 0;
  $scope.displayDistance = 0;
  $scope.displayPush = 0;
  $scope.displayDistancePerPush = 0;

  var sessionNumber = 0;
  var savedSessions = [];

  $scope.payload = function(data){
    $scope.rawDistance = data.payload.distance;

    $scope.displayDistance = data.payload.distance.toFixed(2) + " meters";
    $scope.displayPush = data.payload.pushes;
    $scope.displayDistancePerPush = ((data.payload.distance)/(data.payload.pushes)).toFixed(2) + " meters";

    $scope.$apply();
  };

  $scope.reset = function(){
    conn.message({"devices": "*", "reset": true});
  };

  $scope.resetSessions = function(){
    savedSessions = [];
    sessionNumber = 0;
    updateSession(savedSessions);
  };

  $scope.saveSession = function(){
    sessionNumber ++;
    savedSessions.unshift({"session": sessionNumber, "distance": $scope.rawDistance, "pushes": $scope.displayPush});
    updateSession(savedSessions);
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

  function updateSession(data) {
    conn.update({"savedSessions": data});
  };

  var MESSAGE_SCHEMA = {
    "type": 'object',
    "properties": {
      "distance": {
        "type": "string"
      },
      "pushes": {
        "type": "string"
      }
    }
  };

  var uuid = localStorage.getItem('skate-web-app.uuid');
  var token = localStorage.getItem('skate-web-app.token');

  var connectionOptions = {};
  console.log(connectionOptions)

  if(uuid && token){
    connectionOptions.uuid = uuid;
    connectionOptions.token = token;
  }
  console.log(connectionOptions)
  var conn = meshblu.createConnection(connectionOptions);

  conn.on('ready', function(data){
    console.log('UUID AUTHENTICATED!');
    console.log(data);

    localStorage.setItem('skate-web-app.uuid', uuid);
    localStorage.setItem('skate-web-app.token', token);

    conn.whoami({}, function(device){
      console.log("Device properties", device);
      savedSessions = device.savedSessions;
      sessionNumber = savedSessions[0].session;
    });

    conn.update({
      "uuid": uuid,
      "messageSchema": MESSAGE_SCHEMA,
      "type": "device:skate-web-app",
      "logoUrl": "https://s3-us-west-2.amazonaws.com/octoblu-icons/device/skate-web-app.svg"
    });

    conn.on('message', function(data){
      $scope.payload(data);
    });
  });
});
