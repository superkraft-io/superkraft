#pragma once

#include "../../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_machine.h"

SK_VB_Machine::SK_VB_Machine(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}






void SK_VB_Machine::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    var info = obj->getProperty("data");

    String func = info.getProperty("func", "");

         if (func == "getStaticInfo"  ) getStaticInfo  (msgID, info, responseData);
    else if (func == "getCPUInfo"     ) getCPUInfo     (msgID, info, responseData);
    else if (func == "getMemoryInfo"  ) getMemoryInfo  (msgID, info, responseData);
    else if (func == "getNetworkInfo" ) getNetworkInfo (msgID, info, responseData);
    else if (func == "getMachineTime" ) getMachineTime (msgID, info, responseData);
};


void SK_VB_Machine::getStaticInfo(String msgID, var info, String& responseData) {
    responseData = vbe->sk_c_api->machine.getStaticInfo().str();
}


void SK_VB_Machine::getCPUInfo(String msgID, var info, String& responseData){
    responseData = vbe->sk_c_api->machine.getCPUInfo().str();
}

void SK_VB_Machine::getMemoryInfo(String msgID, var info, String& responseData){
    responseData = vbe->sk_c_api->machine.getMemoryInfo().str();
}

void SK_VB_Machine::getNetworkInfo(String msgID, var info, String& responseData){
    responseData = vbe->sk_c_api->machine.getNetworkInfo().str();
}

void SK_VB_Machine::getMachineTime(String msgID, var info, String& responseData){
    responseData = vbe->sk_c_api->machine.getMachineTime().str();
}

