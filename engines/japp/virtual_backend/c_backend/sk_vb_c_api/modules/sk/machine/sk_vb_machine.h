#pragma once
#include <JuceHeader.h>
class SK_VirtualBackend;

class SK_VB_Machine {
public:
    SK_VirtualBackend * vbe;

    SK_VB_Machine(SK_VirtualBackend * _vbe);

    void handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);

    void getStaticInfo(String msgID, var info, String& responseData);
    void getCPUInfo(String msgID, var info, String& responseData);
    void getMemoryInfo(String msgID, var info, String& responseData);
    void getNetworkInfo(String msgID, var info, String& responseData);
    void getMachineTime(String msgID, var info, String& responseData);
};
