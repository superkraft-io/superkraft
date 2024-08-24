#pragma once

#include "../../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_nodejs_electronjs.h"


#if defined(_WIN32) || defined(_WIN64)
    #include <windows.h>
    #include <shellapi.h>
#elif defined(__APPLE__)
#elif defined(__linux__)
#endif


SK_VB_ElectronJS::SK_VB_ElectronJS(SK_VirtualBackend* _vbe) {
    vbe = _vbe;
}

void SK_VB_ElectronJS::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    var info = obj->getProperty("data");

    String func = info.getProperty("func", "");

         if (func == "showItemInFolder") showItemInFolder(msgID, obj, responseData);
    else if (func == "openPath") openPath(msgID, obj, responseData);
    else if (func == "openExternal") openExternal(msgID, obj, responseData);
    else if (func == "trashItem") trashItem(msgID, obj, responseData);
    else if (func == "beep") beep(msgID, obj, responseData);
    else if (func == "writeShortcutLink") writeShortcutLink(msgID, obj, responseData);
    else if (func == "readShortcutLink") readShortcutLink(msgID, obj, responseData);
};

void SK_VB_ElectronJS::showItemInFolder(String msgID, DynamicObject* obj, String& responseData) {

};

void SK_VB_ElectronJS::openPath(String msgID, DynamicObject* obj, String& responseData) {
    var info = obj->getProperty("data");

    String path = info.getProperty("path", "");

    #if defined(_WIN32) || defined(_WIN64)
        ShellExecute(0, 0, path.toStdString().c_str(), 0, 0, SW_SHOW);
    #elif defined(__APPLE__)
    #elif defined(__linux__)
    #endif
};

void SK_VB_ElectronJS::openExternal(String msgID, DynamicObject* obj, String& responseData) {
    var info = obj->getProperty("data");

    String url = info.getProperty("url", "");

    #if defined(_WIN32) || defined(_WIN64)
        ShellExecute(0, 0, url.toStdString().c_str(), 0, 0, SW_SHOW);
    #elif defined(__APPLE__)
    #elif defined(__linux__)
    #endif
};

void SK_VB_ElectronJS::trashItem(String msgID, DynamicObject* obj, String& responseData) {

};

void SK_VB_ElectronJS::beep(String msgID, DynamicObject* obj, String& responseData) {

};

void SK_VB_ElectronJS::writeShortcutLink(String msgID, DynamicObject* obj, String& responseData) {

};

void SK_VB_ElectronJS::readShortcutLink(String msgID, DynamicObject* obj, String& responseData) {

};
