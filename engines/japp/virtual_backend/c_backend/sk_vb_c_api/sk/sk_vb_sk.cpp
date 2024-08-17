#pragma once

#include "sk_vb_sk.h"

#include "../../sk_vbe/sk_vbe.hxx"

class SK_VirtualBackend;

SK_VB_SK::SK_VB_SK(SK_VirtualBackend *_vbe) {
    vbe = _vbe;

	vfs = new SK_VB_VFS(vbe);
	viewMngr = new SK_VB_View_Mngr(vbe);
	coreNativeActions = new SK_VB_CoreNativeActions(vbe);
	bdfs = new SK_VB_BDFS(vbe);
	web = new SK_VB_Web(vbe);
	application = new SK_VB_Application(vbe);
}

SK_VB_SK::~SK_VB_SK() {
	delete vfs;
	delete viewMngr;
	delete coreNativeActions;
	delete bdfs;
	delete web;
	delete application;
};

void SK_VB_SK::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
	String target = obj->getProperty("target");
	String module = target.substring(target.indexOf(":") + 1, target.length());

	if (module == "vfs") vfs->handle_IPC_Msg(msgID, obj, responseData);
	else if (module == "viewMngr") viewMngr->handle_IPC_Msg(msgID, obj, responseData);
	else if (module == "nativeActions") coreNativeActions->handle_IPC_Msg(msgID, obj, responseData);
	else if (module == "web") web->handle_IPC_Msg(msgID, obj, responseData);
	else if (module == "application") application->handle_IPC_Msg(msgID, obj, responseData);
};