#pragma once


#include <JuceHeader.h>

class SK_VirtualBackend;

class SK_IPC {
public:
    SK_VirtualBackend* vbe;
    SK_IPC(SK_VirtualBackend *_vbe);
    void handle_Native_IPC_Msg(int64 msgIdx, String cmd, DynamicObject *obj);
    void respondToCallback(int64 msgIdx, String data);
};
