#pragma once

#include "../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_nodejs_electronjs.h"


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
    #ifdef _WIN32
        static int platform = 1;
    #elif _WIN64
        static int platform = 1;
    #elif __linux__
        static int platform = 2;
    #elif __APPLE__
        static int platform = 3;
    #else
        static int platform = 0;
    #endif

    std::string str;
    switch (platform) {
    case 1:
        str = "explorer";
        break;
    case 2:
        str = "xdg-open";
        break;
    case 3:
        str = "open";
        break;
    default:
        std::cout << "Should never happen on the 3 defined platforms" << std::endl;
    }

    var info = obj->getProperty("data");

    String path = info.getProperty("path", "");

    str.append(" " + path.toStdString());
    std::system(str.data());
};

void SK_VB_ElectronJS::openExternal(String msgID, DynamicObject* obj, String& responseData) {
    //this is not a correct implementation, but works for now. Should not be relied on.


#ifdef _WIN32
    static int platform = 1;
#elif _WIN64
    static int platform = 1;
#elif __linux__
    static int platform = 2;
#elif __APPLE__
    static int platform = 3;
#else
    static int platform = 0;
#endif

    std::string str;
    switch (platform) {
    case 1:
        str = "explorer";
        break;
    case 2:
        str = "xdg-open";
        break;
    case 3:
        str = "open";
        break;
    default:
        std::cout << "Should never happen on the 3 defined platforms" << std::endl;
    }

    var info = obj->getProperty("data");

    String url = info.getProperty("url", "");

    str.append(" " + url.toStdString());
    std::system(str.data());
};

void SK_VB_ElectronJS::trashItem(String msgID, DynamicObject* obj, String& responseData) {

};

void SK_VB_ElectronJS::beep(String msgID, DynamicObject* obj, String& responseData) {

};

void SK_VB_ElectronJS::writeShortcutLink(String msgID, DynamicObject* obj, String& responseData) {

};

void SK_VB_ElectronJS::readShortcutLink(String msgID, DynamicObject* obj, String& responseData) {

};