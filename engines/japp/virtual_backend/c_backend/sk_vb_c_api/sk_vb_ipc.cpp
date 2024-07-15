#include "sk_vb_ipc.h"
#include "sk_vb_c_api.h"

#include "../sk_virtual_backend.hxx"

class SK_VirtualBackend;

SK_IPC::SK_IPC(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
    /*if (sk_vb->fs != nullptr) {
        sk_vb->fs->respondToCallback = [this](std::int64_t msgIdx, std::string data) {
            this->respondToCallback(msgIdx, data);
        };
    }*/
}

void SK_IPC::handle_Native_IPC_Msg(int64 msgIdx, String cmd, DynamicObject *obj) {
    String res = "{\"error\":\"invalid_command\"}";

    if (cmd == "sk_fs") res = vbe->sk_c_api->fs->handle_IPC_Msg(msgIdx, obj);

    int x = 0;


};

void SK_IPC::respondToCallback(int64 msgIdx, String data) {
    int x = 0;
    //String script = "sk.ipc.execute_Callback_From_C_Backend(" + String(msgIdx) + ", " + data + ")";
    //String script = "alert('from C++ backend')";
    /*String script = "setTimeout(()=>{console.log(sk)}, 1000)";
    vbe->evaluateJavascript(script, [](WebBrowserComponent::EvaluationResult result){
       if (const auto* resultPtr = result.getResult()) {
            DBG(resultPtr->toString());
        } else {
            DBG(result.getError()->message);
        }
    });*/

    auto responseObj = "{\"msgIdx\":" + String(msgIdx) + ", \"data\":" + data + "}";
    vbe->emitEventIfBrowserIsVisible("sk.ipc.callback", responseObj);
}