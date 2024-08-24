#pragma once

#include <JuceHeader.h>
#include "../../../libs/ssc/json.hh"
#include "../.../../libs/threadPool/thpool.h"

class SK_VirtualBackend;

class SK_VB_Web {
public:
    SK_VirtualBackend * vbe;

    unsigned long taskIdx = 0;
    threadpool thpool;

    SK_VB_Web(SK_VirtualBackend * _vbe);
    ~SK_VB_Web();


    void handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);

    void createProgressCallback(String msgID, var info, String& responseData);
    void getProgress(String msgID, var info, String& responseData);

    void request(String msgID, var info, String& responseData);

    void get(String msgID, var info, String& responseData);
    void post(String msgID, var info, String& responseData);
    void download(String msgID, var info, String& responseData);
};
