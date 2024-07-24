#pragma once

#include "../../../sk_vbe/sk_vbe.hxx"

#include "sk_nodejs_electronjs.h"


SK_VB_ElectronJS::SK_VB_ElectronJS(SK_VirtualBackend* _vbe) {
    vbe = _vbe;
}

void SK_VB_ElectronJS::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    var info = obj->getProperty("data");

    String func = info.getProperty("func", "");

    auto x = 0;
};

//implement the different electronjs functions