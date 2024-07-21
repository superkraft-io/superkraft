#pragma once

#include "core/sk_vb_machine.h"
#include "core/sk_vb_app.h"

#include "fs/sk_vb_fs.h"
#include "vfs/sk_vb_vfs.h"
#include "ipc/sk_vb_ipc.h"

#include "view_mngr/sk_view_mngr.h"

class SK_VirtualBackend;

class SK_C_API {
public:
	SK_VirtualBackend* vbe;

	SK_Machine machine;
	SK_App app;

	SK_FS* fs;
	SK_VFS* vfs;
	SK_View_Mngr* viewMngr;
	SK_IPC* ipc;

	SK_C_API(SK_VirtualBackend *_vbe);
	~SK_C_API();
};
