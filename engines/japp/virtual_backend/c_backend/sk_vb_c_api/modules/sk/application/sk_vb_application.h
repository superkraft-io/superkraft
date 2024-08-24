#pragma once
#include <JuceHeader.h>
class SK_VirtualBackend;

class SK_VB_Application {
public:
    SK_VirtualBackend * vbe;

    SK_VB_Application(SK_VirtualBackend * _vbe);

    void handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);

    void getAppInfo(String msgID, var info, String& responseData);
};
