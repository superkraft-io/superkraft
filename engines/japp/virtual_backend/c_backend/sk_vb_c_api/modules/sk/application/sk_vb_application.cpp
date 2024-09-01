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

    if (func == "getStaticInfo") getStaticInfo(msgID, info, responseData);
};


void SK_VB_Application::getStaticInfo(String msgID, var info, String& responseData) {
    //JUCEApplicationBase* instance = JUCEApplicationBase::getInstance();
    String appName = vbe->sk_c_api->sharedClass.product_name;//instance->getApplicationName();
    String appVersion = vbe->sk_c_api->sharedClass.product_version;

    
    

    SSC::JSON::Object res = SSC::JSON::Object::Entries {
        {"argv",  "<argv>"},
        {"argv0",  juce::JUCEApplicationBase::getCommandLineParameterArray()[0].toStdString()},
        {"mode", vbe->mode.toStdString()},
        {"name", appName.toStdString()},
        {"version", appVersion.toStdString()}
    };

    String output = res.str();

    String args = String("[\"" + juce::JUCEApplicationBase::getCommandLineParameterArray().joinIntoString("\",\"") + "\"]");
    if (args == "[\"\"]") {
        args = "[]";
    }
    output = output.replace("\"<argv>\"", args);

    responseData = output.toStdString();
}
