#pragma once

#include "../../../sk_vbe/sk_vbe.hxx"

#include "sk_vb_web.h"

using namespace std::chrono;

SK_VB_Web::SK_VB_Web(SK_VirtualBackend *_vbe) {
    vbe = _vbe;
}




void SK_VB_Web::request(String msgID, var info, String& responseData) {
    String url = info.getProperty("url", "");
    String headers = info.getProperty("headers", "");
    int timeout = info.getProperty("timeout", 7000);
    int follow = info.getProperty("timeout", 5);
    String body = info.getProperty("body", "");


    juce::URL _url = juce::URL::createWithoutParsing(url);
    juce::StringPairArray responseHeaders;
    int statusCode = 0;


    _url = _url.withPOSTData(body);



    std::unique_ptr<juce::InputStream> stream(_url.createInputStream(true, nullptr, nullptr, headers, timeout, &responseHeaders, &statusCode, follow, "POST"));

    DynamicObject res;

    if (stream == nullptr) {
        res.setProperty("error", "stream");
        res.setProperty("status_code", statusCode);
        return;
    }

    responseData = stream->readEntireStreamAsString().toStdString();
}


void SK_VB_Web::handle_IPC_Msg(String msgID, DynamicObject *obj, String& responseData) {
    var info = obj->getProperty("data");

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