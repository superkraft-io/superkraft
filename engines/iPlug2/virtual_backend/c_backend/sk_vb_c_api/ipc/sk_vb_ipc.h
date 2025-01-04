#pragma once


#include <JuceHeader.h>

class SK_VirtualBackend;


class SK_IPC_Msg {
public:
    String type;
    String id;
    String source;
    String target;
    String data;

    SK_IPC_Msg(String _type, String _id, String _source, String _target, String _data) {
        type = _type;
        id = _id;
        source = _source;
        target = _target;
        data = _data;
    }

    String stringifyAsResponse() {
        return "{\"type\":\"response\", \"msgID\": \"" + id + "\", \"source\": \"" + target + "\", \"target\": \"" + source + "\", \"data\": " + data + "}";
    }
};

class SK_IPC_Request_Mngr {
public:

    std::vector <SK_IPC_Msg*> requests;

    void handleRequest() {

    }

    void handleResponse() {

    }

    SK_IPC_Msg* getLatest() {
        return requests[requests.size() - 1];
    }
};

class SK_IPC {
public:
    static inline const String OK = "{}";
    static inline const String Error(String error) {
        return "{\"error\": \"" + error + "\"}";
    };

    SK_VirtualBackend* vbe;
    SK_IPC(SK_VirtualBackend *_vbe);

    SK_IPC_Request_Mngr reqMngr;


    void handle_IPC_Msg(DynamicObject *obj);

    int tryForwardToNativeTarget(DynamicObject* obj, String& responseData, String delimiter = ":");
    void tryForwardToVirtualTarget(DynamicObject* obj);

    void sendTo(String type, String& msgID, String& source, String& target, String& responseData);
};
