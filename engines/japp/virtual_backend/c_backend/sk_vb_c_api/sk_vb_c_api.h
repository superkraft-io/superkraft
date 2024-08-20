#pragma once

#include "core/sk_vb_machine.h"
#include "core/sk_vb_app.h"
#include "core/sk_vb_curl/sk_vb_curl.h"


#include "nodejs/sk_vb_nodejs.h"

#include "ipc/sk_vb_ipc.h"


#include "sk/sk_vb_sk.h"

class SK_VirtualBackend;

class SK_C_API {
public:
	SK_VirtualBackend* vbe;

	SK_Machine machine;
	SK_App app;
	SK_CURL curl;

	SK_VB_SK* sk;
	SK_VB_NodeJS* nodejs;


	SK_IPC* ipc;


	SK_C_API(SK_VirtualBackend *_vbe);
	~SK_C_API();
};
