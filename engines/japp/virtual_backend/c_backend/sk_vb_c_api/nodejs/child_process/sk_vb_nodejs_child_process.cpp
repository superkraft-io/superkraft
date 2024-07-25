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

void SK_VB_NodeJS_ChildProcess::respondError(String msgID, String error, String& responseData) {
    String res = "{\"error\":\"" + error + "\"}";
    vbe->sk_c_api->ipc->respondToCallback(msgID, res);
}



void SK_VB_NodeJS_ChildProcess::exec(String msgID, DynamicObject* obj, String& responseData) {
    #ifdef _WIN32
        static int platform = 1;
    #elif _WIN64
        static int platform = 1;
    #elif __linux__
        static int platform = 2;
    #elif __APPLE__
        static int platform = 3;
    #else
        static int platform = 0;
    #endif

    std::string str;
    switch (platform) {
    case 1:
        str = "explorer";
        break;
    case 2:
        str = "xdg-open";
        break;
    case 3:
        str = "open";
        break;
    default:
        std::cout << "Should never happen on the 3 defined platforms" << std::endl;
    }

    String command = obj->getProperty("command");

    str.append(" " + command.toStdString());
    std::system(str.data());
}

void SK_VB_NodeJS_ChildProcess::execFile(String msgID, DynamicObject* obj, String& responseData) {

}

void SK_VB_NodeJS_ChildProcess::fork(String msgID, DynamicObject* obj, String& responseData) {

}

void SK_VB_NodeJS_ChildProcess::spawn(String msgID, DynamicObject* obj, String& responseData) {

}