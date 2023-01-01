/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

#include <assert.h>
#include <stdio.h>
#include <string.h>
#include "host/ble_hs.h"
#include "host/ble_uuid.h"
#include "services/gap/ble_svc_gap.h"
#include "services/gatt/ble_svc_gatt.h"
#include "blehr_sens.h"
#include "esp_log.h"
#include "heatertest.h"

static const char *tag = "NimBLE_BLE_Heater";

static const char *manuf_name = "Mhyland Technologies LLC.";
static const char *model_num = "BLE Heater 1.0";
uint16_t ess_tmp_handle;
uint16_t heater_set_handle;

static int
gatt_svr_chr_access_heart_rate(uint16_t conn_handle, uint16_t attr_handle,
                               struct ble_gatt_access_ctxt *ctxt, void *arg);

static int
gatt_svr_chr_access_device_info(uint16_t conn_handle, uint16_t attr_handle,
                                struct ble_gatt_access_ctxt *ctxt, void *arg);

static int
gatt_svr_chr_access_heater_setting(uint16_t conn_handle, uint16_t attr_handle,
                                   struct ble_gatt_access_ctxt *ctxt, void *arg);

static int
gatt_svr_chr_write(struct os_mbuf *om, uint16_t min_len, uint16_t max_len,
                   void *dst, uint16_t *len)
{
    uint16_t om_len;
    int rc;

    om_len = OS_MBUF_PKTLEN(om);
    if (om_len < min_len || om_len > max_len) {
        return BLE_ATT_ERR_INVALID_ATTR_VALUE_LEN;
    }

    rc = ble_hs_mbuf_to_flat(om, dst, max_len, len);
    if (rc != 0) {
        return BLE_ATT_ERR_UNLIKELY;
    }

    return 0;
}

static const struct ble_gatt_svc_def gatt_svr_svcs[] = {
    {/* Service: Heart-rate */
     .type = BLE_GATT_SVC_TYPE_PRIMARY,
     //.uuid = BLE_UUID16_DECLARE(GATT_ESS_UUID),
     .uuid = BLE_UUID16_DECLARE(GATT_ESS_UUID),
     .characteristics = (struct ble_gatt_chr_def[]){
         {
             /* Characteristic: Tempature Mesurement */
             .uuid = BLE_UUID128_DECLARE(GATT_ESS_TEMP_UUID),
             .access_cb = gatt_svr_chr_access_heart_rate,
             .val_handle = &ess_tmp_handle,
             .flags = BLE_GATT_CHR_PROP_NOTIFY,
             // TODO also add descriptors
         },
         {
             0, /* No more characteristics in this service */
         },
     }},

    {/* Service: Heater */
     .type = BLE_GATT_SVC_TYPE_PRIMARY,
     .uuid = BLE_UUID128_DECLARE(GATT_HEATER_UUID),
     .characteristics = (struct ble_gatt_chr_def[]){
         {
             /* Characteristic: Tempature Mesurement */
             .uuid = BLE_UUID16_DECLARE(GATT_HEATER_AIR_HEATER_UUID),
             .access_cb = gatt_svr_chr_access_heater_setting,
             .flags = BLE_HEATER_CHAR_PROPS
             // TODO also add descriptors
         },
         {
             0, /* No more characteristics in this service */
         },
     }},
    {/* Service: Device Information */
     .type = BLE_GATT_SVC_TYPE_PRIMARY,
     .uuid = BLE_UUID16_DECLARE(GATT_DEVICE_INFO_UUID),
     .characteristics = (struct ble_gatt_chr_def[]){
         {
             /* Characteristic: * Manufacturer name */
             .uuid = BLE_UUID16_DECLARE(GATT_MANUFACTURER_NAME_UUID),
             .access_cb = gatt_svr_chr_access_device_info,
             .flags = BLE_GATT_CHR_F_READ,
         },
         {
             /* Characteristic: Model number string */
             .uuid = BLE_UUID16_DECLARE(GATT_MODEL_NUMBER_UUID),
             .access_cb = gatt_svr_chr_access_device_info,
             .flags = BLE_GATT_CHR_F_READ,
         },
         {
             0, /* No more characteristics in this service */
         },
     }},
    {
        0, /* No more services */
    },
};

static int
gatt_svr_chr_access_heart_rate(uint16_t conn_handle, uint16_t attr_handle,
                               struct ble_gatt_access_ctxt *ctxt, void *arg)
{
    /* Sensor location, set to "Chest" */
    // static uint8_t body_sens_loc = 0x01;
    // uint16_t uuid;
    // int rc;

    //uuid = ble_uuid_u16(ctxt->chr->uuid);

    // if (uuid == GATT_HRS_BODY_SENSOR_LOC_UUID) {
    //     rc = os_mbuf_append(ctxt->om, &body_sens_loc, sizeof(body_sens_loc));

    //     return rc == 0 ? 0 : BLE_ATT_ERR_INSUFFICIENT_RES;
    // }

    assert(0);
    return BLE_ATT_ERR_UNLIKELY;
}


int
gatt_svr_chr_access_heater_setting(uint16_t conn_handle, uint16_t attr_handle,
                             struct ble_gatt_access_ctxt *ctxt,
                             void *arg)
{
    //const ble_uuid_t *uuid;
    //int rand_num;
    int rc;

    //uuid = ctxt->chr->uuid;

    switch (ctxt->op)
    {
    case BLE_GATT_ACCESS_OP_READ_CHR:
        uint8_t targetTemp = get_TargetTemp();
        rc = os_mbuf_append(ctxt->om, &targetTemp,
                            sizeof targetTemp);
        return rc == 0 ? 0 : BLE_ATT_ERR_INSUFFICIENT_RES;

    case BLE_GATT_ACCESS_OP_WRITE_CHR:
        uint8_t writeVal = 0;
        rc = gatt_svr_chr_write(ctxt->om,
                                sizeof writeVal,
                                sizeof writeVal,
                                &writeVal, NULL);
        if(writeVal != 0){
            set_TargetTemp(writeVal);
        }
        return rc;

    default:
        assert(0);
        return BLE_ATT_ERR_UNLIKELY;
    }

    /* Unknown characteristic; the nimble stack should not have called this
     * function.
     */
    assert(0);
    return BLE_ATT_ERR_UNLIKELY;
}

static int
gatt_svr_chr_access_device_info(uint16_t conn_handle, uint16_t attr_handle,
                                struct ble_gatt_access_ctxt *ctxt, void *arg)
{
    uint16_t uuid;
    int rc;

    uuid = ble_uuid_u16(ctxt->chr->uuid);

    if (uuid == GATT_MODEL_NUMBER_UUID)
    {
        rc = os_mbuf_append(ctxt->om, model_num, strlen(model_num));
        return rc == 0 ? 0 : BLE_ATT_ERR_INSUFFICIENT_RES;
    }

    if (uuid == GATT_MANUFACTURER_NAME_UUID)
    {
        rc = os_mbuf_append(ctxt->om, manuf_name, strlen(manuf_name));
        return rc == 0 ? 0 : BLE_ATT_ERR_INSUFFICIENT_RES;
    }

    assert(0);
    return BLE_ATT_ERR_UNLIKELY;
}

void gatt_svr_register_cb(struct ble_gatt_register_ctxt *ctxt, void *arg)
{
    char buf[BLE_UUID_STR_LEN];

    switch (ctxt->op)
    {
    case BLE_GATT_REGISTER_OP_SVC:
        MODLOG_DFLT(DEBUG, "registered service %s with handle=%d\n",
                    ble_uuid_to_str(ctxt->svc.svc_def->uuid, buf),
                    ctxt->svc.handle);
        break;

    case BLE_GATT_REGISTER_OP_CHR:
        MODLOG_DFLT(DEBUG, "registering characteristic %s with "
                           "def_handle=%d val_handle=%d\n",
                    ble_uuid_to_str(ctxt->chr.chr_def->uuid, buf),
                    ctxt->chr.def_handle,
                    ctxt->chr.val_handle);
        break;

    case BLE_GATT_REGISTER_OP_DSC:
        MODLOG_DFLT(DEBUG, "registering descriptor %s with handle=%d\n",
                    ble_uuid_to_str(ctxt->dsc.dsc_def->uuid, buf),
                    ctxt->dsc.handle);
        break;

    default:
        assert(0);
        break;
    }
}

int gatt_svr_init(void)
{
    int rc;

    ble_svc_gap_init();
    ble_svc_gatt_init();
    char str[100]; // character array to store the resulting string

    // Interpolate the integer value into the string

    rc = ble_gatts_count_cfg(gatt_svr_svcs);

    sprintf(str, "The value of rc is %d", rc);
    ESP_LOGI(tag, "%s", str);

    if (rc != 0)
    {
        return rc;
    }

    rc = ble_gatts_add_svcs(gatt_svr_svcs);
    if (rc != 0)
    {
        return rc;
    }

    return 0;
}
