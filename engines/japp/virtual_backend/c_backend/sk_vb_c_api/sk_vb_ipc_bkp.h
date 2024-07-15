#pragma once


#include <JuceHeader.h>
#include "sk_vb_fs.h"
//#include "../sk_virtual_backend.hxx"


using namespace juce;

class SK_IPC {
public:
    //SK_VirtualBackend* vbe;
    SK_FS* fs;

    SK_IPC::SK_IPC() {
        /*if (fs != nullptr) {
            fs->respondToCallback = [this](std::int64_t msgIdx, std::string data) {
                this->respondToCallback(msgIdx, data);
            };
        }*/
    }

    void SK_IPC::handle_Native_IPC_Msg(int64 msgIdx, String cmd, DynamicObject* obj){
        String res = "{\"error\":\"invalid_command\"}";

        if (cmd == "sk_fs") res = fs->handle_IPC_Msg(msgIdx, obj);

        int x = 0;


    };

    void SK_IPC::respondToCallback(int64 msgIdx, String data) {
        int x = 0;
        //vbe->evaluateJavascript("sk.ipc.execute_Callback_From_C_Backend(" + String(msgIdx) + ", '" + data + "')");
    }
};
