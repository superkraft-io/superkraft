#pragma once

#include "../../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_nodejs_process.h"

#include <iostream>
#include <cstdlib>

extern char** environ;


SK_VB_NodeJS_Process::SK_VB_NodeJS_Process(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}

void SK_VB_NodeJS_Process::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    var info = obj->getProperty("data");
    

    String func = info.getProperty("func", "");
    if (func == "env") env(msgID, obj, responseData);
};




void SK_VB_NodeJS_Process::env(String msgID, DynamicObject* obj, String& responseData) {
    SSC::JSON::Object json = SSC::JSON::Object{};

    for (char** env = environ; *env != nullptr; ++env) {
        String envStr = String(*env);
        StringArray paramsArr;
        paramsArr.addTokens(envStr, "=", "");

        json.set(paramsArr[0].toStdString(), paramsArr[1].replace("\\", "\\\\").toStdString());
    }

    responseData = json.str();
}
