#include "sk_vb_ipc.h"
#include "../sk_vb_c_api.h"

#include "../../sk_vbe/sk_vbe.hxx"

class SK_VirtualBackend;

SK_IPC::SK_IPC(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}

void SK_IPC::handle_IPC_Msg(DynamicObject *obj) {

    String responseData = "{\"error\":\"invalid_ipc_request\"}";

    String type = obj->getProperty("type");
    String source = obj->getProperty("source");

    if (type == "request") {
        //First try to handle a native target, such as SK FS...
        if (tryForwardToNativeTarget(obj, responseData) == 0){
            //so we send the request to the correct target.
              tryForwardToVirtualTarget(obj);
        }
        else {
            if (source != "sk_be"){
                //respond to view
                auto msg = SK_IPC_Msg(
                    "response",
                    obj->getProperty("msgID"),
                    obj->getProperty("source"),
                    obj->getProperty("target"),
                    responseData
                );

                String responsePacket = msg.stringifyAsResponse();


                auto view = vbe->sk_c_api->sk->viewMngr->findViewByID(source);
                if (view != nullptr) {
                    view->emitEventIfBrowserIsVisible("sk.ipc", responsePacket);
                }
                else {
                    throw "Invalid IPC target";
                }
            }
        }
    }
    else if (type == "response") {
        //Once the target returns a response, we forward the response data to the source.
        //We do this by populating "responseData".


        String source = obj->getProperty("source");

        String target = obj->getProperty("target");

        auto view = vbe->sk_c_api->sk->viewMngr->findViewByID(target);
        if (view != nullptr) {
            view->emitEventIfBrowserIsVisible("sk.ipc", obj);
        }
        else {
            //throw "Invalid IPC target";
        }

    }

    if (responseData == "ignore") return;

    auto msg = SK_IPC_Msg(
        "response",
        obj->getProperty("msgID"),
        obj->getProperty("source"),
        obj->getProperty("target"),
        responseData
    );

    String responsePacket = msg.stringifyAsResponse();

    if (source == "sk_be"){
        //respond to virtual backend
        vbe->emitEventIfBrowserIsVisible("sk.ipc", String(responsePacket));
    }

};


int SK_IPC::tryForwardToNativeTarget(DynamicObject* obj, String& responseData, String delimiter) {
    String target = obj->getProperty("target");

    String targetPrefix = target.substring(0, target.indexOf(":"));

    if (targetPrefix.length() == 0) {
        targetPrefix = target;
    }

    std::vector<juce::String> native_target = {
        "sk",
        "node"
    };

    bool isNativeTarget = false;

    for (int i = 0; i < native_target.size(); i++) {
        String prefix = native_target[i];

        if (targetPrefix == prefix) {
            isNativeTarget = true;
            break;
        }
    }

    if (isNativeTarget == false) {
        return 0;
    }


    String msgID = obj->getProperty("msgID");

    if (targetPrefix == "sk") vbe->sk_c_api->sk->handle_IPC_Msg(msgID, obj, responseData);
    else if (targetPrefix == "node") vbe->sk_c_api->nodejs->handle_IPC_Msg(msgID, obj, responseData);

    return 1;
}


void SK_IPC::tryForwardToVirtualTarget(DynamicObject* obj) {
    String target = obj->getProperty("target");

    if (target == "sk_be") {
        vbe->emitEventIfBrowserIsVisible("sk.ipc", obj);
    }
    else {
        auto view = vbe->sk_c_api->sk->viewMngr->findViewByID("");
        if (view != nullptr) {
            view->emitEventIfBrowserIsVisible("sk.ipc", obj);
        }
        else {
            throw "Invalid IPC target";
        }
    }

}


void SK_IPC::sendTo(String type, String& msgID, String& source, String& target, String& responseData) {
    auto msg = SK_IPC_Msg(
        type,
        msgID,
        source,
        target,
        responseData
    );

    String responsePacket = msg.stringifyAsResponse();

    if (source == "sk_be") {
        //respond to virtual backend
        vbe->emitEventIfBrowserIsVisible("sk.ipc", String(responsePacket));
    }
    else {
        auto view = vbe->sk_c_api->sk->viewMngr->findViewByID(source);
        if (view != nullptr) {
            view->emitEventIfBrowserIsVisible("sk.ipc", responsePacket);
        }
    }
}
