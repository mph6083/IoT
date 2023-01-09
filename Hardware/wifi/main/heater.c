#include "esp_system.h"
#include "esp_log.h" // logging

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/timers.h"
#include <stdbool.h>
// #include "ds18b20.h" //temp sensor

#include "driver/gpio.h" //turn on and off pins
#include "heater.h"

#define TEMP_PIN 14
#define HEATER_PIN 15

static float currentTemp = 0;
static uint16_t TargetTemp = 70; // will eventually need to be saved in flash memory
static bool isOn = false;
const int DS_PIN = 14; // GPIO where you connected ds18b20

static const char *TAG = "heater";

void toggleHeater(bool on)
{
    isOn = on;
    if (shouldMock == false)
    {
        if (on)
        {
            gpio_set_level(HEATER_PIN, 1);
        }
        else
        {
            gpio_set_level(HEATER_PIN, 0);
        }
    }
}

void set_TargetTemp(uint8_t newTemp)
{
    TargetTemp = newTemp;
    ESP_LOGI(TAG, "new Target Temp is: %i", newTemp);
}
uint8_t get_TargetTemp()
{
    ESP_LOGI(TAG, "Target Temp Accessed: %i", TargetTemp);
    return TargetTemp;
}
float get_Temp()
{
    ESP_LOGI(TAG, "Current Temp Accessed: %i", currentTemp);
    return currentTemp;
}

static void poll_temp()
{
    if (shouldMock == true)
    {
        currentTemp = currentTemp + 1;
        if (currentTemp > 90)
        {
            currentTemp = 50;
        }
        if (currentTemp < 50)
        {
            currentTemp = 50;
        }
    }
    if(shouldMock == false){
        currentTemp = ds18b20_get_temp();
    }
}

static void heat_controller()
{
    if (currentTemp <= TargetTemp - 1)
    {
        if (isOn == false)
        {
            ESP_LOGI(TAG, "Heater Turned On %f", currentTemp);
        }
        toggleHeater(true);
    }
    else
    {
        if (isOn == true)
        {
            ESP_LOGI(TAG, "Heater Turned Off %f", currentTemp);
        }
        toggleHeater(false);
    }
}

void init_heater()
{
    if(shouldMock == false){
        ds18b20_init(DS_PIN);
    }
    TimerHandle_t pollTimer = xTimerCreate("Timer", espsecond, pdTRUE, NULL, poll_temp);
    xTimerStart(pollTimer, 0);

    TimerHandle_t heatControlTimer = xTimerCreate("Timer2", espsecond * 5, pdTRUE, NULL, heat_controller);
    xTimerStart(heatControlTimer, 0);
}
