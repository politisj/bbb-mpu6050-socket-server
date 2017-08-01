/**
 * 29-Jul-2017  John Politis
 */
var i2c = require('i2c-bus'), bus = i2c.openSync(2);
/**
 *  Defines all the MPU6050 internal register mappings
 */
var BASE_ADDRESS    = 0x68;         //Base address for the mpu6050 accelerometer
var CMD_PWR_MGMT_1  = 0x6b;
var WHO_AM_I        = 0x75;
var ACCEL_XOUT_H    = 0x3b;
var ACCEL_XOUT_L    = 0x3c;
var ACCEL_YOUT_H    = 0x3d;
var ACCEL_YOUT_L    = 0x3e;
var ACCEL_ZOUT_H    = 0x3f;
var ACCEL_ZOUT_L    = 0x40;
var GYRO_XOUT_H     = 0x43;
var GYRO_XOUT_L     = 0x44;
var GYRO_YOUT_H     = 0x45;
var GYRO_YOUT_L     = 0x46;
var GYRO_ZOUT_H     = 0x47;
var GYRO_ZOUT_L     = 0x48;
                                                          /* Refer to Page 12 of the data book for scaling factors */
var ACCELEROMETER_SENSITIVITY_SCALE_FACTOR = 16384;       /* used to scale down the accelerometers raw data coming from the mpu's registers */
var GYRO_SENSITIVITY_SCALE_FACTOR = 131;                  /* used to scale down the Gyro's raw data coming from the mpu's registers */


/**
 *  29-Jul-2017  John Politis
 *  Interface for our accelerometer
 */
var mpu6050 = {
    device_id:          undefined,
    acceleromter_pid:   undefined,
    gyro_pid:           undefined,
    acceleromter :      {x: undefined , y: undefined, z: undefined },
    gyro:               {x: undefined , y: undefined, z: undefined },
    /**
     *  29-Jul-2017  John Politis
     *      initialize our sensor
     */
    init: function() {
        console.log('mpu6050::intialized');
        bus.writeByteSync(BASE_ADDRESS, CMD_PWR_MGMT_1, 0);
        mpu6050.device_id = bus.readByteSync(BASE_ADDRESS, WHO_AM_I);
    },
    /**
     *  29-Jul-2017  John Politis
     *      We need to construct a 16 bit signed number from the individual raw sensors
     *      high byte and low byte.
     *      Returns the constructed number
     */
    convert: function(high,low) {
        var temp = 0x0000;
        temp = high << 8;
        temp = temp | low;
        temp = (~temp) +1;      //2's compliment
        return temp;
    },
    /**
     *  29-Jul-2017  John Politis
     */
    get_accelerometer_data: function(){

        mpu6050.acceleromter.x = (mpu6050.convert( bus.readByteSync(BASE_ADDRESS, ACCEL_XOUT_H) ,bus.readByteSync(BASE_ADDRESS, ACCEL_XOUT_L)) / ACCELEROMETER_SENSITIVITY_SCALE_FACTOR );
        mpu6050.acceleromter.y = (mpu6050.convert(bus.readByteSync(BASE_ADDRESS, ACCEL_YOUT_H) , bus.readByteSync(BASE_ADDRESS, ACCEL_YOUT_L)) / ACCELEROMETER_SENSITIVITY_SCALE_FACTOR );
        mpu6050.acceleromter.z = (mpu6050.convert(bus.readByteSync(BASE_ADDRESS, ACCEL_ZOUT_H) , bus.readByteSync(BASE_ADDRESS, ACCEL_ZOUT_L)) / ACCELEROMETER_SENSITIVITY_SCALE_FACTOR );

    },
    /**
     *  29-Jul-2017  John Politis
     */
    get_gyro_data: function() {

        mpu6050.gyro.x = (mpu6050.convert(bus.readByteSync(BASE_ADDRESS, GYRO_XOUT_H), bus.readByteSync(BASE_ADDRESS, GYRO_XOUT_L))  / GYRO_SENSITIVITY_SCALE_FACTOR );
        mpu6050.gyro.y = (mpu6050.convert(bus.readByteSync(BASE_ADDRESS, GYRO_YOUT_H), bus.readByteSync(BASE_ADDRESS, GYRO_YOUT_L))  / GYRO_SENSITIVITY_SCALE_FACTOR );
        mpu6050.gyro.z = (mpu6050.convert(bus.readByteSync(BASE_ADDRESS, GYRO_ZOUT_H), bus.readByteSync(BASE_ADDRESS, GYRO_ZOUT_L))  / GYRO_SENSITIVITY_SCALE_FACTOR );
    },
    /**
     *  29-Jul-2017  John Politis
     *      This will sart the sampling routine, the user can adjust the sampling rate, upon which the user's
     *      callback routine will be issued.
     */
    run: function(freq,cb) {

        if (mpu6050.acceleromter_pid === undefined) {
           mpu6050.acceleromter_pid = setInterval(function() {
               
               /* update our global structure to reflect the sensors changes */
               mpu6050.get_accelerometer_data();
               mpu6050.get_gyro_data();
               
               /* Optional call back if required by the user .*/
               if (cb !== undefined ) cb();
            }, freq );
        }
    }
};

/**
 *  29-Jul-2017  John Politis
 *         Start's our initilization routine
 */
(function () {
  
  mpu6050.init();
  
}());

exports.mpu6050 = mpu6050;

