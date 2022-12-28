#include <stdio.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/timers.h"

#include "esp_system.h"
#include "esp_log.h"       // logging

#include "ds18b20.h" //temp sensor

#include "driver/gpio.h" //turn on and off pins


#define PollTempSeconds 15

#define TEMP_PIN 14
#define HEATER_PIN 15

float currentTemp = 0;
bool heaterStatus = false;
float TargetTemp = 70.0; // will eventually need to be saved in flash memory

const int DS_PIN = 14; // GPIO where you connected ds18b20

void enableHeater()
{
    gpio_set_level(HEATER_PIN, 1);
}

void disableHeater()
{
    gpio_set_level(HEATER_PIN, 0);
}

void PollTemp()
{
    currentTemp = ds18b20_get_temp();
}

void setTargetTemp(float newTemp)
{
    TargetTemp = newTemp;
}
float getTargetTemp()
{
    return TargetTemp;
}

void heat_controller(){
        if(currentTemp <= getTargetTemp() - 1){
            enableHeater();
        }
        else{
            disableHeater();
        }
}

void app_main(void)
{
    // initalize ds temp sensor
    ds18b20_init(DS_PIN);
    // Init Timer for sensor polling
    int timeWait = (1000) / portTICK_PERIOD_MS;
    TimerHandle_t timer = xTimerCreate("Timer", timeWait, pdTRUE, NULL, PollTemp);
    xTimerStart(timer, 0);

    //init checker for temp
    int timeWait2 = (1000 * PollTempSeconds) / portTICK_PERIOD_MS;
    TimerHandle_t timer2 = xTimerCreate("Timer", timeWait2, pdTRUE, NULL, heat_controller);
    xTimerStart(timer2, 0);

    vTaskStartScheduler();
}
