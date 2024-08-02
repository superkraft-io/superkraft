#pragma once
#include <JuceHeader.h>

class SK_VirtualBackend;

class SK_VB_NodeJS_ChildProcess {
public:
    SK_VirtualBackend * vbe;
    
    SK_VB_NodeJS_ChildProcess(SK_VirtualBackend * _vbe);
    
    void SK_VB_NodeJS_ChildProcess::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);


    void exec(String msgID, DynamicObject* obj, String& responseData);
    void execFile(String msgID, DynamicObject* obj, String& responseData);
    void fork(String msgID, DynamicObject* obj, String& responseData);
    void spawn(String msgID, DynamicObject* obj, String& responseData);
};
