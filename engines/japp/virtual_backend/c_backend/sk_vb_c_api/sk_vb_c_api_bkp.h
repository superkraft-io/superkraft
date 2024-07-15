#pragma once

#include "sk_vb_fs.h"
#include "sk_vb_ipc.h"

class SK_C_API {
public:
	//SK_VirtualBackend* vbe;

	SK_FS* fs = new SK_FS();
	SK_IPC* ipc = new SK_IPC();
	
	SK_C_API::SK_C_API() {
		ipc->fs = fs;
	}

	SK_C_API::~SK_C_API() {
		free(ipc);
		free(fs);
	}

	/*void SK_C_API::propagate_vbe_pointer(SK_VirtualBackend* _vbe) {
		vbe = _vbe;

		//fs->ipc = ipc;
	}*/
};
