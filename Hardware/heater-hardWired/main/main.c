#include <stdio.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/timers.h"

#include "esp_system.h"
#include "esp_log.h" // logging

#include "heater/heater.h"

#define espsecond (1000 * 1) / portTICK_PERIOD_MS

void app_main(void)
{
    init_heater();
}
