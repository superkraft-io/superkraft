#pragma once
#include <JuceHeader.h>

#include "handleParamMouseEvent/sk_vb_cNA_handleParamMouseEvent.h"

#include "../../../../../../../../../sk_nativeActions/sk_nativeActions.h"

class SK_VirtualBackend;

class SK_VB_CoreNativeActions {
public:
    SK_VirtualBackend* vbe;
    SK_VB_CoreNativeActions(SK_VirtualBackend* _vbe);

    SK_VB_cNA_handleParamComponentMouseEvent handleParamComponentMouseEvent;
    SK_Project_NativeActions projectNativeActions;

    void handle_IPC_Msg(String msgID, DynamicObject* obj, String& responseData);
};
