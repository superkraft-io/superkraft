#pragma once

#include "../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_web.h"

using namespace std::chrono;

SK_VB_Web::SK_VB_Web(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
    thpool = thpool_init(8); // 8 threads
}
SK_VB_Web::~SK_VB_Web() {
    thpool_destroy(thpool);
}

typedef struct {
    unsigned long id;
    SK_VirtualBackend * vbe;

    String msgID;
    String source;
    String target;

    Jayson opt;
    String responseData;
} webRequestTask;


void SK_VB_Web::request(String msgID, var info, String& responseData) {
    String url = info.getProperty("url", "");
    
    //validate URL
    if (url == "") {
        responseData = "{\"error\":\"invalid_url\"}";
        return;
    }

    String body = info.getProperty("body", "{}");
    String mimeType = info.getProperty("mimeType", "");
    String headers = info.getProperty("headers", "");

    taskIdx++;

    webRequestTask* reqTask = new webRequestTask();
    

    reqTask->vbe = vbe;
    reqTask->id = taskIdx;
    reqTask->source = info.getProperty("source", "");
    reqTask->target = info.getProperty("target", "");
    reqTask->msgID = msgID;

    reqTask->opt = {
        {"url", url.toStdString()},
        {"body", body.toStdString()},
        {"mimeType", mimeType.toStdString()},
        {"headers", headers.toStdString()}
    };

    //thpool_add_work(thpool, task, (void*)dat);

    juce::MessageManager::callAsync([this, reqTask]() -> void {
        Jayson reqRes = vbe->sk_c_api->curl->post(reqTask->opt);

        const char* error = nullptr;

        try {
            error = std::any_cast<const char*>(reqRes["error"]);
        }
        catch (const std::bad_any_cast& e) {
            //can't cast if it doesn't exist, therefor everything is ok
        }

        if (error != nullptr)
            reqTask->responseData = "{\"error\":\"" + String(error) + "\"}";
        else
            reqTask->responseData = std::any_cast<std::string>(reqRes["data"]);


        vbe->sk_c_api->ipc->sendTo("response", reqTask->msgID, reqTask->source, reqTask->target, reqTask->responseData);

        free(reqTask);
    });

    responseData = "ignore";
}

void SK_VB_Web::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    String sender = obj->getProperty("source");

    var info = obj->getProperty("data");
    info.getDynamicObject()->setProperty("msgID", msgID);
    info.getDynamicObject()->setProperty("source", obj->getProperty("source"));
    info.getDynamicObject()->setProperty("target", obj->getProperty("target"));

    String func = info.getProperty("func", "");

         if (func == "createProgressCallback") createProgressCallback(msgID, info, responseData);
    else if (func == "getProgress") getProgress(msgID, info, responseData);
    else if (func == "get") get(msgID, info, responseData);
    else if (func == "post") post(msgID, info, responseData);
    else if (func == "download") download(msgID, info, responseData);
};


void SK_VB_Web::createProgressCallback(String msgID, var info, String& responseData) {

}

void SK_VB_Web::getProgress(String msgID, var info, String& responseData) {

}




void SK_VB_Web::get(String msgID, var info, String& responseData) {

}

void SK_VB_Web::post(String msgID, var info, String& responseData) {
    request(msgID, info, responseData);
}


void SK_VB_Web::download(String msgID, var info, String& responseData) {

}