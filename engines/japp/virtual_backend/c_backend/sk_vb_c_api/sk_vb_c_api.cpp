#pragma once

#include "sk_vb_c_api.h"
SK_C_API::SK_C_API(SK_VirtualBackend *_vbe) {
	vbe = _vbe;
	fs = new SK_FS(vbe);
	ipc = new SK_IPC(vbe);
}

SK_C_API::~SK_C_API() {
	delete ipc;
	delete fs;
}

/*void SK_C_API::propagate_vbe_pointer(SK_VirtualBackend* _vbe) {
	vbe = _vbe;

	//fs->ipc = ipc;
}*/