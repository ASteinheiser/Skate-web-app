var app = angular.module('MyApp',['ngMaterial']);

app.controller('AppCtrl', function($scope) {

  $scope.displayDistance = 0;
  $scope.displayPush = 0;
  $scope.displayDistancePerPush = 0;

  var sessionNumber = 1;
  var savedSessions = [];

  function sendMessage(topic, message){
    conn.message({
      "devices": "*",
      topic: message
    });
  };

  $scope.saveSession = function(){
    savedSessions.unshift({"session": sessionNumber, "distance": $scope.rawDistance, "pushes": $scope.displayPush});
    sessionNumber ++;
    conn.message({"devices": "*", "save": true, "savedSessions": savedSessions});
  }

  $scope.reset = function(){
    sendMessage("reset", true);
  }

  $scope.payload = function(data){
    $scope.rawDistance = data.payload.distance;
    $scope.displayDistance = data.payload.distance.toFixed(2);
    $scope.displayPush = data.payload.pushes;
    $scope.displayDistancePerPush = ((data.payload.distance)/(data.payload.pushes)).toFixed(2);

    $scope.$apply()
  }

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

    conn.update({
      "uuid": GET.uuid,
      "messageSchema": MESSAGE_SCHEMA
    });

    conn.on('message', function(data){
      $scope.payload(data);
    });
  });
});
