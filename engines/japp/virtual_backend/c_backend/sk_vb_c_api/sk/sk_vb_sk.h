#pragma once


#include <JuceHeader.h>

#include "vfs/sk_vb_vfs.h"
#include "view_mngr/sk_vb_view_mngr.h"
#include "../../../../../../../sk_nativeActions/sk_nativeActions.h"
#include "coreNativeActions/sk_vb_coreNativeActions.h"
#include "bdfs/sk_vb_bdfs.h"


class SK_VirtualBackend;


class SK_VB_SK {
public:
    SK_VirtualBackend* vbe;

    SK_VB_VFS* vfs;
    SK_VB_View_Mngr* viewMngr;
    SK_VB_CoreNativeActions* coreNativeActions;
    SK_VB_BDFS* bdfs;

    SK_VB_SK::SK_VB_SK(SK_VirtualBackend *_vbe);
    SK_VB_SK::~SK_VB_SK();


    void SK_VB_SK::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData);
};
