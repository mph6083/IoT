/**
 * file Heater.h
 * Author:Matthew Hyland
 */

/** 
 * initalize the heater pins and background processes 
*/
void init_heater();

void toggleHeater(bool on);

void set_TargetTemp(float newTemp);
float get_TargetTemp();
float get_Temp();
static void poll_temp();
static void heat_controller();
