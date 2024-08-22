#pragma once

#include <JuceHeader.h>
#include "../../../libs/ssc/json.hh"

class SK_VirtualBackend;

class SK_VB_Web {
public:
    SK_VirtualBackend * vbe;

    SK_VB_Web(SK_VirtualBackend * _vbe);


    void SK_VB_Web::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);

    void SK_VB_Web::createProgressCallback(String msgID, var info, String& responseData);
    void SK_VB_Web::getProgress(String msgID, var info, String& responseData);

    void SK_VB_Web::request(String msgID, var info, String& responseData);

    void SK_VB_Web::get(String msgID, var info, String& responseData);
    void SK_VB_Web::post(String msgID, var info, String& responseData);
    void SK_VB_Web::download(String msgID, var info, String& responseData);
};
