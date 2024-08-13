#pragma once

#include "../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_nodejs_child_process.h"



SK_VB_NodeJS_ChildProcess::SK_VB_NodeJS_ChildProcess(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}

void SK_VB_NodeJS_ChildProcess::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    var info = obj->getProperty("data");
    

    String func = info.getProperty("func", "");
    if (func == "exec") exec(msgID, obj, responseData);
    else if (func == "execFile") execFile(msgID, obj, responseData);
    else if (func == "fork") fork(msgID, obj, responseData);
    else if (func == "spawn") spawn(msgID, obj, responseData);
};




void SK_VB_NodeJS_ChildProcess::exec(String msgID, DynamicObject* obj, String& responseData) {
    var info = obj->getProperty("data");

    String path = info.getProperty("path", "");

    #if defined(_WIN32) || defined(_WIN64)
        ShellExecute(0, 0, path.toStdString().c_str(), 0, 0, SW_SHOW);
    #elif defined(__APPLE__( || )
    #elif defined(__linux__)
    #endif
}

void SK_VB_NodeJS_ChildProcess::execFile(String msgID, DynamicObject* obj, String& responseData) {

}

void SK_VB_NodeJS_ChildProcess::fork(String msgID, DynamicObject* obj, String& responseData) {

}

void SK_VB_NodeJS_ChildProcess::spawn(String msgID, DynamicObject* obj, String& responseData) {

}