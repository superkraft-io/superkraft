#pragma once

#include "../../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_nodejs_process.h"

#include <iostream>
#include <cstdlib>


namespace fs = std::filesystem;
extern char** environ;


SK_VB_NodeJS_Process::SK_VB_NodeJS_Process(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}

void SK_VB_NodeJS_Process::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    var info = obj->getProperty("data");
    

    String func = info.getProperty("func", "");
    if (func == "env") env(msgID, obj, responseData);
    else if (func == "chdir") chdir(msgID, obj, responseData);
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



void SK_VB_NodeJS_Process::chdir(String msgID, DynamicObject* obj, String& responseData) {
    var info = obj->getProperty("data");
    String directory = info.getProperty("directory", "");

    if (directory == "") {
        SK_IPC::respondWithError(msgID, "Path may not be empty", responseData);
        return;
    }


    bool failed = false;

    #if defined(_WIN32) || defined(_WIN64)
        try {
            fs::path newPath = directory.toStdString().c_str();

            fs::current_path(newPath);
        }
        catch (const fs::filesystem_error& e) {
            failed = true;
        }
    #else
        const char* newPath = directory.toStdString().c_str();

        if (chdir(newPath) != 0) {
            failed = true;
        }
    #endif

    if (failed == true) {

        SK_IPC::respondWithError(msgID, "Could not change working directory", responseData);
        return;
    }

    responseData = SK_IPC::OK;;
}
