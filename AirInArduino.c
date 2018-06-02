#include <Wire.h>
#include <AM2320.h>

//온도 습도 설정
AM2320 th;

//미세먼지 설정
int pin = 9;
unsigned long duration;
unsigned long starttime;
unsigned long sampletime_ms = 30000;//sampe 30s ;
unsigned long lowpulseoccupancy = 0;

float pcsPerCF = 0;
float ugm3 = 0;
float ratio = 0;
float concentration = 0;

void setup() {
  Serial.begin(9600);
  Wire.begin();
  pinMode(9, INPUT);
  starttime = millis();        //get the current time;
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(7,INPUT_PULLUP);
}


void loop() {
  duration = pulseIn(pin, LOW);
  lowpulseoccupancy = lowpulseoccupancy + duration;

  if ((millis() - starttime) > sampletime_ms) //if the sampel time == 30s
  {
    ratio = lowpulseoccupancy / (sampletime_ms * 10.0); // Integer percentage 0=>100
    concentration = 1.1 * pow(ratio, 3) - 3.8 * pow(ratio, 2) + 520 * ratio + 0.62; // using spec sheet curve
    pcsPerCF = concentration * 1000;
    ugm3 = pcsPerCF / 13000;
    Serial.print("1-");
    Serial.println(ugm3);
    lowpulseoccupancy = 0;
    delay(100);

    starttime = millis();
  }

  switch(th.Read()) {
    case 0:
      th.Read();
      Serial.print("2-");
      Serial.println(th.cTemp);
      delay(100);
      Serial.print("3-");
      Serial.println(th.Humidity);
      delay(100);
      break;
  }
  digitalWrite(LED_BUILTIN,!digitalRead(7));
  Serial.print("4-");
  Serial.println(digitalRead(7));
  delay(100);

}
