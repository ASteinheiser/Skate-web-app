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
    sessionNumber = 1;
    updateSession(savedSessions);
  };

  $scope.saveSession = function(){
    sessionNumber ++;
    savedSessions.unshift({"session": sessionNumber, "distance": $scope.rawDistance, "pushes": $scope.displayPush});
    updateSession(savedSessions);
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

  var GET = {};
  var query = window.location.search.substring(1).split("&");

  for (var i = 0, max = query.length; i < max; i++){
    if (query[i] === "")
    continue;
    var param = query[i].split("=");
    GET[decodeURIComponent(param[0])] = decodeURIComponent(param[1] || "");
  }

  var conn = meshblu.createConnection({
    "uuid": GET.uuid,
    "token": GET.token
  });

  conn.on('ready', function(data){
    console.log('UUID AUTHENTICATED!');
    console.log(data);

    conn.whoami({}, function(device){
      savedSessions = device.savedSessions;
      sessionNumber = savedSessions[0].session;
    });

    conn.update({
      "uuid": GET.uuid,
      "messageSchema": MESSAGE_SCHEMA,
      "type": "device:skate-web-app",
      "logoUrl": "https://s3-us-west-2.amazonaws.com/octoblu-icons/device/skate-web-app.svg"
    });

    conn.on('message', function(data){
      $scope.payload(data);
    });
  });
});
