#pragma once

#include "sk_vb_c_api.h"

SK_C_API::SK_C_API(SK_VirtualBackend *_vbe) {
	vbe = _vbe;
	fs = new SK_FS(vbe);
	vfs = new SK_VFS(vbe);
	ipc = new SK_IPC(vbe);
	viewMngr = new SK_View_Mngr(vbe);
}

SK_C_API::~SK_C_API() {
	delete ipc;
	delete fs;
	delete viewMngr;
}

/*void SK_C_API::propagate_vbe_pointer(SK_VirtualBackend* _vbe) {
	vbe = _vbe;

	//fs->ipc = ipc;
}*/