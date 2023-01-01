#include "esp_system.h"
#include "esp_log.h" // logging

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/timers.h"

#include "ds18b20.h" //temp sensor

#include "driver/gpio.h" //turn on and off pins
#include "heatertest.h"

#define TEMP_PIN 14
#define HEATER_PIN 15

#define espsecond (1000 * 1) / portTICK_PERIOD_MS

static float currentTemp = 0;
static float TargetTemp = 70.0; // will eventually need to be saved in flash memory

const int DS_PIN = 14; // GPIO where you connected ds18b20


static const char *TAG = "heater";

void toggleHeater(bool on)
{
}

void set_TargetTemp(float newTemp)
{
    TargetTemp = newTemp;
}
float get_TargetTemp()
{
    return TargetTemp;
}
float get_Temp()
{
    return currentTemp;
}

static void poll_temp()
{
    currentTemp = currentTemp + 1;
    if(currentTemp > 90){
        currentTemp = 50;
    }
    if(currentTemp < 50){
        currentTemp = 50;
    }
    // currentTemp = ds18b20_get_temp();
}

static void heat_controller()
{
    ESP_LOGI(TAG, "Polled the Heat Controller");
    if (currentTemp <= get_TargetTemp() - 1)
    {
        toggleHeater(true);
    }
    else
    {
        toggleHeater(false);
    }
}

void init_heater()
{
    //ds18b20_init(DS_PIN);

    TimerHandle_t pollTimer = xTimerCreate("Timer", espsecond, pdTRUE, NULL, poll_temp);
    xTimerStart(pollTimer, 0);

    TimerHandle_t heatControlTimer = xTimerCreate("Timer2", espsecond * 5, pdTRUE, NULL, heat_controller);
    xTimerStart(heatControlTimer, 0);
}
