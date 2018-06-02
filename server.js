var SerialPort = require('serialport'); //아두이노와 시리얼 통신할 수 있는 모듈
var parsers = SerialPort.parsers;
var parser = new parsers.Readline({
  delimiter: '\r\n'
});

//ubidots 연결
var ubidots = require('ubidots');
var client = ubidots.createClient('BBFF-42c1d32ee052243010a1dd861d2d91b75bb');

//라즈베리파이와 연결된 디바이스 주소
var port = new SerialPort('/dev/ttyACM0', {
  baudRate: 9600
});

//gpio
var gpio = require("gpio");
var gpio22 = gpio.export(22, {
   direction: "in",
   ready: function() {
   }
});

//포트 열기
port.pipe(parser);
port.on('open', function() {
  console.log('port open');
});

// open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
});

client.auth(function() {
  var send_in_air = this.getVariable('5afab9c3642ab6461f5eca53');
  var send_in_temp = this.getVariable('5afaba00642ab6453f72f650');
  var send_in_humi = this.getVariable('5affb44c642ab67c7705273e');
  var send_in_detect = this.getVariable('5b0e83f7642ab679eb510223');
  var get_in_auto = this.getVariable('5afc0db9642ab65a452cab31');

  parser.on('data', function(data) {
    console.log(data);
    var str = data.toString();
    var strArray = str.split('-');
    var sensorObj;

    if (strArray[0] == '1') {
      sensorObj = strArray[1];
      send_in_air.saveValue(sensorObj)
    } else if (strArray[0] == '2') {
      sensorObj = strArray[1];
      send_in_temp.saveValue(sensorObj);
    } else if (strArray[0] == '3') {
      sensorObj = strArray[1];
      send_in_humi.saveValue(sensorObj);
    } else if (strArray[0] == '4') {
      sensorObj = strArray[1];
      send_in_detect.saveValue(sensorObj);
    }
  });
});

function aircon() {
  client.auth(function() {
    var get_in_auto = this.getVariable('5afc0db9642ab65a452cab31');
    var now_aircon;
    get_in_auto.getValues(function (err, data) {
      now_aircon = data.results[0].value;
      console.log("aircone : " + now_aircon);
    });
    if(now_aircon == 1){
      // sets pin to high
      gpio22.set(function() {
         console.log(gpio4.value);    // should log 1
      });
    }
    else{
      gpio22.set(0, function() {
         console.log(gpio4.value);    // should log 0
      });
    }
  });
}


setInterval(aircon, 1000);
