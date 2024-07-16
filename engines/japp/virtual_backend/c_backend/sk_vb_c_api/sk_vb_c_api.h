#pragma once

#include "modules/sk_vb_os.h"

#include "sk_vb_fs.h"
#include "sk_vb_ipc.h"

class SK_VirtualBackend;

class SK_C_API {
public:
	SK_VirtualBackend* vbe;

	SK_Machine machine;

	SK_FS *fs;
	SK_IPC *ipc;

	SK_C_API(SK_VirtualBackend *_vbe);
	~SK_C_API();
};
