#pragma once

#include "../sk_vb_c_api/helpers/sk_vb_mimeTypes.h"
#include "../sk_vb_c_api/helpers/sk_vb_web_resource.h"


#include "../../../../../../sk_vb_shared_class.hxx"

#include "core/sk_machine.h"
#include "core/sk_curl/sk_curl.h"

#include "sk_router/sk_vb_router.h"
#include "ipc/sk_vb_ipc.h"



#include "modules/nodejs/sk_vb_nodejs.h"
#include "modules/sk/sk_vb_sk.h"

class SK_VirtualBackend;

class SK_C_API {
public:
	SK_VirtualBackend* vbe;
    
    SK_VB_Router router;
    
	SK_VB_Shared_Class sharedClass;

	SK_Machine machine;

	SK_CURL* curl;

	SK_VB_SK* sk;
	SK_VB_NodeJS* nodejs;

	SK_IPC* ipc;


	SK_C_API(SK_VirtualBackend *_vbe);
	~SK_C_API();
};
