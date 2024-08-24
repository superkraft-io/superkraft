#pragma once
#include <JuceHeader.h>

class SK_VirtualBackend;

class SK_VB_cNA_handleParamComponentMouseEvent {
public:
    SK_VirtualBackend* vbe;
    SK_VB_cNA_handleParamComponentMouseEvent(SK_VirtualBackend* _vbe);

    void handle_IPC_Msg(String msgID, DynamicObject* obj, String& responseData);
};
