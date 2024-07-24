#pragma once

#include "sk_vb_c_api.h"

SK_C_API::SK_C_API(SK_VirtualBackend *_vbe) {
	vbe = _vbe;

	nodejs = new SK_VB_NodeJS(vbe);

	vfs = new SK_VFS(vbe);
	ipc = new SK_IPC(vbe);
	viewMngr = new SK_View_Mngr(vbe);
}

SK_C_API::~SK_C_API() {
	delete ipc;
	delete viewMngr;
	delete nodejs;
}