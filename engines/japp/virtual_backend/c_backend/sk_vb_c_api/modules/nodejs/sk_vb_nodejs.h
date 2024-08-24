#pragma once


#include <JuceHeader.h>

#include "fs/sk_vb_nodejs_fs.h"
#include "child_process/sk_vb_nodejs_child_process.h"

#include "electronjs/sk_vb_nodejs_electronjs.h"

class SK_VirtualBackend;


class SK_VB_NodeJS {
public:
    SK_VirtualBackend* vbe;

    SK_FS* fs;
    SK_VB_NodeJS_ChildProcess* child_process;

    SK_VB_ElectronJS* electronjs;


    SK_VB_NodeJS(SK_VirtualBackend *_vbe);
    ~SK_VB_NodeJS();


    void handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);
};
