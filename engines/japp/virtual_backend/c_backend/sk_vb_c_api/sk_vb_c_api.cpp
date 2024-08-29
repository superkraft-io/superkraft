#pragma once

#include "sk_vb_c_api.h"

SK_C_API::SK_C_API(SK_VirtualBackend *_vbe) : sharedClass(_vbe), router(_vbe) {
	vbe = _vbe;
    
    curl = new SK_CURL(vbe);

	sk = new SK_VB_SK(vbe);
	nodejs = new SK_VB_NodeJS(vbe);

	ipc = new SK_IPC(vbe);
}

SK_C_API::~SK_C_API() {
	delete curl;
	delete ipc;
	delete sk;
	delete nodejs;
}
