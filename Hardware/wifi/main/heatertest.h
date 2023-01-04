/**
 * file Heatertest.h
 * Author:Matthew Hyland
 */

#define espsecond (1000 * 1) / portTICK_PERIOD_MS
#include <stdbool.h>

/** 
 * initalize the heater pins and background processes 
*/
void init_heater();

void toggleHeater(bool on);

void set_TargetTemp(uint8_t newTemp);
uint8_t get_TargetTemp();
float get_Temp();
