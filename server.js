

var SerialPort = require('serialport'); //아두이노와 시리얼 통신할 수 있는 모듈
var parsers = SerialPort.parsers;
var parser = new parsers.Readline({
    delimiter: '\r\n'
});

//라즈베리파이와 연결된 디바이스 주소
var port = new SerialPort('/dev/ttyACM0', {
    baudRate: 9600
});


var switch_value;

//ubidots 연결
var ubidots = require('ubidots');
var client = ubidots.createClient('BBFF-42c1d32ee052243010a1dd861d2d91b75bb');

client.auth(function () {
  var send_in_air = this.getVariable('5afab9c3642ab6461f5eca53');
  var send_out_air = this.getVariable('5afab9b9642ab64592357ed1');
  var send_switch = this.getVariable('5afab9d1642ab64677b501eb');
  var send_in_temp = this.getVariable('5afaba00642ab6453f72f650');
  var send_out_temp = this.getVariable('5afc0d18642ab659c69e72ec');
  var send_in_humi = this.getVariable('5affb44c642ab67c7705273e');
  var send_out_humi = this.getVariable('5affb45b642ab67cdfa37987');

  send_in_air.saveValue('56');
  send_out_air.saveValue('160');
  send_switch.saveValue('1');
  send_in_temp.saveValue(37);
  send_out_temp.saveValue(40.23);
  send_in_humi.saveValue(55.23);
  send_out_humi.saveValue(60.23);

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

parser.on('data', function(data) {
    console.log('Read and Send Data : ' + data);
    var sensorObj = data.toString(); // json 형식 data를 객체형식으로 저장
    switch_value = "On";

});
