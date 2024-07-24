#pragma once
#include <JuceHeader.h>

class SK_VirtualBackend;

class SK_VB_ElectronJS {
public:
    SK_VirtualBackend* vbe;
    
    SK_VB_ElectronJS(SK_VirtualBackend* _vbe);
    
    void SK_VB_ElectronJS::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);

    void SK_VB_ElectronJS::showItemInFolder(String msgID, DynamicObject* obj, String& responseData);
    void SK_VB_ElectronJS::openPath(String msgID, DynamicObject* obj, String& responseData);
    void SK_VB_ElectronJS::openExternal(String msgID, DynamicObject* obj, String& responseData);
    void SK_VB_ElectronJS::trashItem(String msgID, DynamicObject* obj, String& responseData);
    void SK_VB_ElectronJS::beep(String msgID, DynamicObject* obj, String& responseData);
    void SK_VB_ElectronJS::writeShortcutLink(String msgID, DynamicObject* obj, String& responseData);
    void SK_VB_ElectronJS::readShortcutLink(String msgID, DynamicObject* obj, String& responseData);
};
