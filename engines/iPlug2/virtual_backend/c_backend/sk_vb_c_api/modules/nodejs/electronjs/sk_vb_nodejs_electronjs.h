#pragma once
#include <JuceHeader.h>

class SK_VirtualBackend;

class SK_VB_ElectronJS {
public:
    SK_VirtualBackend* vbe;
    
    SK_VB_ElectronJS(SK_VirtualBackend* _vbe);
    
    void handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);

    void showItemInFolder(String msgID, DynamicObject* obj, String& responseData);
    void openPath(String msgID, DynamicObject* obj, String& responseData);
    void openExternal(String msgID, DynamicObject* obj, String& responseData);
    void trashItem(String msgID, DynamicObject* obj, String& responseData);
    void beep(String msgID, DynamicObject* obj, String& responseData);
    void writeShortcutLink(String msgID, DynamicObject* obj, String& responseData);
    void readShortcutLink(String msgID, DynamicObject* obj, String& responseData);
};
