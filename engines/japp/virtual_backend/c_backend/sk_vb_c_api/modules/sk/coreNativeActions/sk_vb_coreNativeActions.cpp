#pragma once
#include "sk_vb_coreNativeActions.h"


SK_VB_CoreNativeActions::SK_VB_CoreNativeActions(SK_VirtualBackend* _vbe) : handleParamComponentMouseEvent(_vbe), projectNativeActions(_vbe)
{
    vbe = _vbe;
}

void SK_VB_CoreNativeActions::handle_IPC_Msg(String msgID, DynamicObject* obj, String& responseData) {
    var reqInfo = obj->getProperty("data");

    String func = reqInfo.getProperty("func", "");

    if (func == "listActions") {
        StringArray tmpActions(projectNativeActions.actions);
        tmpActions.add("handleParamComponentMouseEvent");

        StringArray actions;
        for (int i = 0; i < tmpActions.size(); i++) actions.add("\"" + tmpActions[i] + "\"");

        responseData = "{\"actions\":[" + actions.joinIntoString(",") + "]}";
    }
    else if (func == "handleParamComponentMouseEvent") handleParamComponentMouseEvent.handle_IPC_Msg(msgID, obj, responseData);
    else {
        if (func == "login") {
            int x = 0;
        }

        if (projectNativeActions.actions.contains(func) == true){
            projectNativeActions.handle_IPC_Msg(msgID, obj, responseData);
        }
        else {
            responseData = "{\"error\":\"invalid_action\", \"action\":\"" + func + "\"}";
        }
    }
};