#pragma once

#include "../../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_application.h"

using namespace std::chrono;

SK_VB_Application::SK_VB_Application(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}






void SK_VB_Application::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    var info = obj->getProperty("data");

    String func = info.getProperty("func", "");

    if (func == "getAppInfo") getAppInfo(msgID, info, responseData);
};


void SK_VB_Application::getAppInfo(String msgID, var info, String& responseData) {
    String appName = JUCEApplicationBase::getInstance()->getApplicationName();
    String appVersion = JUCEApplicationBase::getInstance()->getApplicationVersion();

    SSC::JSON::Object res = SSC::JSON::Object::Entries {
        {"mode", vbe->mode.toStdString()},
        {"name", appName.toStdString()},
        {"version", appVersion.toStdString()}
    };

    responseData = res.str();
}
