#include "../../sk_vbe/sk_vbe.hxx"

class SK_VirtualBackend;

SK_VB_NodeJS::SK_VB_NodeJS(SK_VirtualBackend *_vbe) {
    vbe = _vbe;

	fs = new SK_FS(vbe);
	child_process = new SK_VB_NodeJS_ChildProcess(vbe);
}

SK_VB_NodeJS::~SK_VB_NodeJS() {
	delete fs;
};

void SK_VB_NodeJS::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
	String target = obj->getProperty("target");
	String module = target.substring(target.indexOf(":") + 1, target.length());

	if (module == "fs") fs->handle_IPC_Msg(msgID, obj, responseData);
	else if (module == "child_process") child_process->handle_IPC_Msg(msgID, obj, responseData);
	else if (module == "electronjs") electronjs->handle_IPC_Msg(msgID, obj, responseData);
};