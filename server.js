var SerialPort = require('serialport'); //아두이노와 시리얼 통신할 수 있는 모듈
var parsers = SerialPort.parsers;
var parser = new parsers.Readline({
  delimiter: '\r\n'
});

//카메라 사용자 촬영 설정
var timeInMs;
var exec_photo = require('child_process').exec;
var photo_path;
var cmd_photo;
var moment = require('moment');

//ubidots 연결
var ubidots = require('ubidots');
var client = ubidots.createClient('BBFF-42c1d32ee052243010a1dd861d2d91b75bb');

//라즈베리파이와 연결된 디바이스 주소
var port = new SerialPort('/dev/ttyACM0', {
  baudRate: 9600
});

var onoff = require('onoff');
var Gpio = onoff.Gpio;
var power = new Gpio(22, 'out');

var scp = require('scp');

var options = {
  file: '~/Documents/AirInCar/public/images/img.jpg',
  user: 'JEONG IL',
  host: '192.168.25.55',
  port: '22',
  path: '~'
}

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
      now_aircon = data.results[0].value.toString();
      console.log("aircone : " + now_aircon);

      if(now_aircon == 1){
        // sets pin to high
        power.writeSync(1);
        console.log("power.writeSync(1);");
      }
      else{
        power.writeSync(0);
        console.log("power.writeSync(0);");
      }
    });
  });
}


setInterval(aircon, 1000);

// 카메라 설정 시간 간격 마다 촬영 실행
function camera_starting(){
    camera_setting(); // 처음 한번 촬영
    camera_interval = setInterval(camera_setting, 3000); // 설정 시간 후에 반복 촬영
};

// 현재 시간으로 카메라 설정 세팅
function camera_setting(){
    timeInMs = moment().format('YYYYMMDDHHmmss');
    photo_path = __dirname+"/images/img.jpg";
    cmd_photo = 'raspistill -vf -t 1 -w 370 -h 280 -o '+photo_path;
    setTimeout(() => {
        camera_shooting();
      }, 500);
};

// 설정된 값으로 카메라 촬영
function camera_shooting(){
    exec_photo(cmd_photo,function(err,stdout,stderr){
        if(err){
            console.log('child process exited with shooting_photo error code', err.code);
            return;
        }
        console.log("photo captured with filename: " +timeInMs);
        camera_sending();
    });
}

// 촬영 이미지 전송
function camera_sending(){
  scp.send(options, function (err) {
    if (err) console.log(err);
    else console.log('File transferred.');
  });
};

camera_starting();
